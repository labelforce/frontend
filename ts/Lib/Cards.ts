///<reference path="../../typings/tsd.d.ts"/>

declare var gajus : any;

module Lib {
    interface ICardConfig {
        wrapper : string;
        like? : string;
        dislike? : string;
        image? : string;
        likeClass? : string;
        dislikeClass? : string;
        appearingClass? : string;
        likeAnimationLength? : number;
        appearingAnimationLength? : number;
        name? : string;
    }

    interface IAnswer {
        picture_id : number;
        label : number;
        is_label : boolean;
    }

    export class Cards {

        private static DEFAULTCONFIG : ICardConfig = {
            wrapper: '',
            like: '.like-button',
            dislike: '.dislike-button',
            image: '.swipe_image',
            likeClass: 'like',
            dislikeClass: 'dislike',
            appearingClass: 'appearing',
            likeAnimationLength: 1000,
            appearingAnimationLength: 1000,
            name : '.js-label'
        };

        private config : ICardConfig;
        private items : IPicture[] = [];
        private $image : JQuery;

        private correctCallbacks : (() => void)[] = [];
        private incorrectCallbacks : (() => void)[] = [];
        private firebase : Firebase;

        public constructor(config : ICardConfig) {
            this.firebase = new Firebase('https://boiling-heat-2521.firebaseio.com/swiped');
            this.firebase.authWithCustomToken('eoyakpIFmf4LTm6JcUPElixc8ieeQujvDF7bCGNh', () => {});

            this.config = $.extend(true, {}, Cards.DEFAULTCONFIG, config);
            log.debug('Cards', 'config', this.config);

            $(this.config.wrapper).find(this.config.like).on('click', () => {
                log.debug('Cards', 'like click');
                this.like();
            });

            $(this.config.wrapper).find(this.config.dislike).on('click', () => {
                log.debug('Cards', 'like dislike');
                this.dislike();
            });

            this.$image = $(this.config.wrapper).find(this.config.image);
            var hammer = new Hammer.Manager( this.$image[0] );
            hammer.add(new Hammer.Swipe({
                velocity: .00001,
                distance: .0625
            }));
            hammer.on('swipeleft',  () => {
                log.debug('Cards', 'dislike swipe');
                this.dislike();

            });
            hammer.on('swiperight', () => {
                log.debug('Cards', 'like swipe');
                this.like();

            });
        }

        /**
         * Likes the current image
         */
        public like() : void {
            log.info('Cards', 'like');
            this.sendAnswer({
                picture_id: this.items[0].id,
                label: this.items[0].label,
                is_label: true
            });

            this.items.splice(0,1);

            this.$image.addClass(this.config.likeClass);
            log.text('Cards', 'adding Class', this.config.likeClass);

            setTimeout(() => {
                this.$image.removeClass(this.config.likeClass);
                log.text('Cards', 'removing Class', this.config.likeClass);

                this.update();

                this.$image.addClass(this.config.appearingClass);
                log.text('Cards',' adding Class', this.config.appearingClass);

                setTimeout(() => {
                    this.$image.removeClass(this.config.appearingClass);
                    log.text('Cards', 'removing Class', this.config.appearingClass);

                }, this.config.appearingAnimationLength);
            }, this.config.likeAnimationLength);
        }

        /**
         * Dislikes the current image
         */
        public dislike() : void {

            this.sendAnswer({
                picture_id: this.items[0].id,
                label: this.items[0].label,
                is_label: true
            });

            this.items.splice(0,1);

            this.$image.addClass(this.config.dislikeClass);
            log.text('Cards', 'adding Class', this.config.dislikeClass);

            setTimeout(() => {
                this.$image.removeClass(this.config.dislikeClass);
                log.text('Cards', 'removing Class', this.config.dislikeClass);

                this.update();

                this.$image.addClass(this.config.appearingClass);
                log.text('Cards',' adding Class', this.config.appearingClass);

                setTimeout(() => {
                    this.$image.removeClass(this.config.appearingClass);
                    log.text('Cards', 'removing Class', this.config.appearingClass);

                }, this.config.appearingAnimationLength);
            }, this.config.likeAnimationLength);
        }

        /**
         * Sends answer to the service
         */
        private sendAnswer(answer : IAnswer) : Promise<any> {
            return new Promise((resolve : Function, reject : Function) => {
                this.firebase.push(answer, resolve);
                /*// TODO have real implementation here
                if(Math.random() > .5) {
                    // correct
                    this.executeCorrect();
                } else {
                    this.executeIncorrect();
                }

                // TODO implement
                reject();*/
            })
        }

        public setItems(items : IPicture[]) {
            this.items = items;
        }

        public update() {
            var url : string;
            if(this.items.length === 0) {
                url = 'http://placehold.it/200x200?text=No%20more%20images'
            } else {
                url = '/img/img/' + this.items[0].id + '.jpg';
            }
            log.info('Cards', 'update', url);
            $(this.config.wrapper).find(this.config.name).text(this.items[0].id);
            $(this.config.wrapper).find(this.config.image).attr('style', 'background-image: url(' + url + ')');
        }

        public onCorrect(callback : () => void) {
            this.correctCallbacks.push(callback);
        }

        public onIncorrect(callback : () => void) {
            this.incorrectCallbacks.push(callback);
        }

        private executeCorrect() : void {
            this.correctCallbacks.forEach((callback : () => void) => {
                callback();
            })
        }

        private executeIncorrect() : void {
            this.incorrectCallbacks.forEach((callback : () => void) => {
                callback();
            })
        }

    }
}