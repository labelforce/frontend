module Lib {
    interface ILevel {
        name : string;
        pointThreshold : number;
    }

    interface ILevelingConfig {
        level? : string;
        levelTemplate? : string;
        ether? : string;
        points? : string;
        nextEther? : string;
        nextPoints? : string;
    }

    interface IScore {
        exp : number;
        ether : number;
    }

    export class Leveling {

        private static DEFAULTCONFIG : ILevelingConfig = {
            level: '.level',
            levelTemplate: '{{level.name}}',
            ether: '.js-ether',
            points : '.js-points',
            nextEther: '.js-nextEther',
            nextPoints: '.js-nextPoints'
        };

        private static level : ILevel[] = [
            {name: 'You suck', pointThreshold: -10},
            {name: 'That\'s Bad', pointThreshold: -5},
            {name: 'Uh Oh', pointThreshold: -5},
            {name: 'First Time User', pointThreshold: 0},
            {name: 'Beginner', pointThreshold: 10},
            {name: 'Novice', pointThreshold: 20},
            {name: 'Advanced', pointThreshold: 35},
            {name: 'Pro', pointThreshold: 60},
            {name: 'God', pointThreshold: 100},
        ];

        private cards : Cards;

        private points : number = 0;
        private ether : number = 0;
        private nextEther : number = 1;
        private nextPoints : number = Math.round(Math.random() * 2);

        private config : ILevelingConfig;

        public constructor(cards : Cards, config : ILevelingConfig = {}) {

            Util.FirebaseUtil.getFirebase('score').then((firebase : Firebase) => {
                firebase.on('value', (value) => {
                    var score : IScore = value.val()[Util.HashUtil.getHashNum()];
                    log.info('Leveling', 'score received', score);
                    if(score !== null) {
											
												this.nextEther = Math.abs(this.ether - score.ether);
												this.nextPoints = Math.abs(this.points - score.exp);

												var nextEther = document.getElementById('next-ether');
												var nextPoints = document.getElementById('next-points'); 

												var currentEther = document.getElementById('ether');
												var currentPoints = document.getElementById('points');

												nextEther.innerHTML = this.nextEther.toString();
												nextPoints.innerHTML = this.nextPoints.toString();

												nextPoints.classList.add('active');
												nextEther.classList.add('active');


												// lets do some animation at 7.25 am ;)


												var delay = 90;
												var distance = 180;

												// 1.5 sec is needed for the css animation
												setTimeout(() => {
													this.ether = score.ether;
													this.points = score.exp;
													this.update();


													nextPoints.classList.add('invisible');
													nextEther.classList.add('invisible');

													nextPoints.classList.remove('active');
													nextEther.classList.remove('active');

													setTimeout(() => {
													
														nextPoints.classList.remove('invisible');
														nextEther.classList.remove('invisible');
													}, 1500);

												}, 1500);
                    }
                })
            });

            this.cards = cards;
            this.config = $.extend(true, {}, Leveling.DEFAULTCONFIG, config);

            Save.getInstance().has('points').then(() => {
                Save.getInstance().get('points').then((points : number) => {
                    log.debug('Leveling', 'loading points', points);
                    if(points === null) return;
                    this.points = points;
                    this.update();
                })
            });

            Save.getInstance().has('ether').then((has : boolean) => {
                    Save.getInstance().get('ether').then((ether : number) => {
                        log.debug('Leveling', 'loading ether', ether);
                        if(ether === null) return;
                        this.ether = ether;
                        this.update();
                    })
            });

            this.cards.onCorrect(() => {this.correct()});
            this.cards.onIncorrect(() => {this.incorrect()});
            this.update();
        }

        public correct() : void {
            this.points += this.nextPoints;
            this.ether += this.nextEther;
            log.info('Leveling', 'correct', this.points);
            this.persist();
            this.update();
        }

        public incorrect() : void {
            this.points -= this.nextPoints;
            this.ether -= this.nextEther;
            log.info('Leveling', 'incorrect', this.points);
            this.persist();
            this.update();
        }

        private persist() : void {
            log.info('Leveling', 'persisting', this.points, this.ether);
            Save.getInstance().set('points', this.points);
            Save.getInstance().set('ether', this.ether);
        }

        public getCurrentLevel() : ILevel {
            for(var i : number = 0; i < Leveling.level.length; i++) {
                if(Leveling.level[i].pointThreshold > this.points) {
                    return Leveling.level[i-1];
                }
            }
        }

        public update() {
            var template : HandlebarsTemplateDelegate = Handlebars.compile(this.config.levelTemplate);
            var content : string = template({
                points: this.points,
                level: this.getCurrentLevel()
            });

            $(this.config.level).html(content);
            $(this.config.points).html(this.points.toString());
            $(this.config.ether).html(this.ether.toString());

            this.nextEther = Math.round(Math.random() * 2);

            $(this.config.nextEther).html(this.nextEther.toString());
            $(this.config.nextPoints).html(this.nextPoints.toString());
        }
    }
}
