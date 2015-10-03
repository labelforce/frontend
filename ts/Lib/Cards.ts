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
    }

    interface IAnswer {
        picture_id : number;
        label : number;
        is_label : boolean;
    }

    export class Cards {

        private static DEFAULTCONFIG : ICardConfig = {
            wrapper: '',
            like: '.like',
            dislike: '.dislike',
            image: '.swipe_image',
            likeClass: 'like',
            dislikeClass: 'dislike',
            appearingClass: 'appearing',
            likeAnimationLength: 1000,
            appearingAnimationLength: 1000
        };

        private config : ICardConfig;
        private items : IPicture[] = [];
        private $image : JQuery;

        public constructor(config : ICardConfig) {
            this.config = $.extend(true, {}, Cards.DEFAULTCONFIG, config);

            $(this.config.wrapper).find(this.config.like).on('click', () => {
                this.like();
            });

            $(this.config.wrapper).find(this.config.dislike).on('click', () => {
                this.dislike();
            });

            this.$image = $(this.config.wrapper).find(this.config.image);
            var hammer = new Hammer.Manager( this.$image[0] );
            hammer.add(new Hammer.Swipe({
                velocity: .00001,
                distance: .0625
            }));
            hammer.on('swipeleft',  () => {
                this.dislike();

            });
            hammer.on('swiperight', () => {
                this.like();

            });
        }

        /**
         * Likes the current image
         */
        public like() : void {

            this.sendAnswer({
                picture_id: this.items[0].id,
                label: this.items[0].label,
                is_label: true
            });

            this.items.splice(0,1);

            this.$image.addClass(this.config.likeClass);
            setTimeout(() => {
                this.$image.removeClass(this.config.likeClass);
                this.update();
                this.$image.addClass(this.config.appearingClass);
                setTimeout(() => {
                    this.$image.removeClass(this.config.appearingClass);
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
            setTimeout(() => {
                this.$image.removeClass(this.config.dislikeClass);
                this.update();
                this.$image.addClass(this.config.appearingClass);
                setTimeout(() => {
                    this.$image.removeClass(this.config.appearingClass);
                }, this.config.appearingAnimationLength);
            }, this.config.likeAnimationLength);
        }

        /**
         * Sends answer to the service
         */
        private sendAnswer(answer : IAnswer) : Promise<any> {
            return new Promise((resolve : Function, reject : Function) => {
                // TODO implement
                reject();
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
            $(this.config.wrapper).find(this.config.image).attr('style', 'background-image: url(' + url + ')');
        }

    }
}