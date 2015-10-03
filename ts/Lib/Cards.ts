///<reference path="../../typings/tsd.d.ts"/>

declare var gajus : any;

module Lib {
    interface ICardConfig {
        wrapper : string;
        like? : string;
        dislike? : string;
        image? : string;
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
            image: 'img'
        };

        private config : ICardConfig;
        private items : IPicture[] = [];

        public constructor(config : ICardConfig) {
            this.config = $.extend(true, {}, Cards.DEFAULTCONFIG, config);
            debugger;
            $(this.config.wrapper).find(this.config.like).on('click', () => {
                this.like();
            });

            $(this.config.wrapper).find(this.config.dislike).on('click', () => {
                this.dislike();
            })
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
            this.update();
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
            this.update();
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
            $(this.config.wrapper).find(this.config.image).attr('src', url);
        }

    }
}