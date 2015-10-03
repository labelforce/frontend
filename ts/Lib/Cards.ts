///<reference path="../../typings/tsd.d.ts"/>

declare var gajus : any;

module Lib {
    interface ICardConfig {
        wrapper : string;
        like? : string;
        dislike? : string;
    }

    interface IItem {
        id : number;
    }

    export class Cards {

        private static DEFAULTCONFIG : ICardConfig = {
            wrapper: '',
            like: '.like',
            dislike: '.dislike'
        };

        private config : ICardConfig;
        private items : IItem[] = [];

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

        public like() : void {
            console.log("like")
            // TODO implement
        }

        public dislike() : void {
            console.log("dislike")
            // TODO implement
        }

        public setItems(items : IItem[]) {
            this.items = items;
        }

    }
}