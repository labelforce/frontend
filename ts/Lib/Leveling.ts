module Lib {
    interface ILevel {
        name : string;
        pointThreshold : number;
    }

    interface ILevelingConfig {
        level? : string;
        levelTemplate? : string;
    }

    export class Leveling {

        private static DEFAULTCONFIG : ILevelingConfig = {
            level: '.level',
            levelTemplate: '<b>{{points}}</b> ({{level.name}})'
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

        private config : ILevelingConfig;

        public constructor(cards : Cards, config : ILevelingConfig = {}) {
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

            this.cards.onCorrect(() => {this.correct()});
            this.cards.onIncorrect(() => {this.incorrect()});
            this.update();
        }

        public correct() : void {
            this.points++;
            log.info('Leveling', 'correct', this.points);
            this.persist();
            this.update();
        }

        public incorrect() : void {
            this.points--;
            log.info('Leveling', 'incorrect', this.points);
            this.persist();
            this.update();
        }

        private persist() : void {
            log.info('Leveling', 'persisting', this.points);
            Save.getInstance().set('points', this.points);
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
        }
    }
}