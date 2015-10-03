/**
 *                       _
 *                      | |
 *    _____   _____ _ __| | __ _ _   _ _ __
 *   / _ \ \ / / _ \ '__| |/ _` | | | | '__|
 *  | (_) \ V /  __/ |  | | (_| | |_| | |
 *   \___/ \_/ \___|_|  |_|\__,_|\__, |_|
 *                                __/ |
 *                               |___/
 *
 * @file      Provides the logger
 * @author    Johannes Hertenstein <j6s@thej6s.com>, overlayr
 * @copyright 2015 overlayr, all rights reserved
 **/
/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./Save" />


module Lib {

    /**
     * Logger: Simple abstraction over console.log adding different logging levels
     * and a means to disable logging
     */
    export class Logger {

        /**
         * The name of the current logger.
         * The selected logging level will be saved in indexdb using this as identifier
         */
        private name : string = null;

        /**
         * The logging level selected by the current user
         */
        private level : number = 99;

        /**
         * These are our logging levels
         */
        public TEXT    : number = 10;
        public DEBUG   : number = 20;
        public INFO    : number = 30;
        public WARNING : number = 40;
        public ERROR   : number = 50;
        public FATAL   : number = 60;

        /**
         * Here we configure the text that will get prepended to the logging messages
         * indicating the loging level as well as the style to be used.
         */
        private levels : {[name : string] : {text : string; style : string}} = {
            'TEXT':    {
                'text':  'text    ',
                'style': 'background: #fff; color: #999;'
            },
            'DEBUG':   {
                'text':  'debug   ',
                'style': 'background: #fff; color: #000;'
            },
            'INFO':    {
                'text':  'INFO    ',
                'style': 'background: #ddd; color: #00f;'
            },
            'WARNING': {
                'text':  'WARNING ',
                'style': 'background: #e92; color: #fff;'
            },
            'ERROR':   {
                'text':  '   ERROR   ',
                'style': 'background: #f33; color: #ddd;'
            },
            'FATAL':   {
                'text':  '     FATAL     ',
                'style': 'background: #f00; color: #fff;'
            }
        };

        /**
         * Constructor: Loads the current logging level if set
         *
         * @param name  The name of the identifier in storage
         */
        constructor(name : string = "debug") {
            this.name = name;

            this.debug('Lib.Logger', 'constructor', name);
            Lib.Save.getInstance().has(this.name).then((has : boolean) => {

                this.debug('Lib.Logger', 'loading level', this.name, 'exists', has);

                var promises : Promise<any>[] = [];
                if(!has) {
                    promises.push(Lib.Save.getInstance().set(this.name, 99));
                }

                Promise.all(promises).then(() => {
                    Lib.Save.getInstance().get(this.name).then((level : number) => {
                        this.info('Lib.Logger', 'loading level', level);
                        this.level = level;
                    });
                });
            });
        }

        /**
         * sets the logging level
         *
         * @param level     The desired level
         */
        public set(level : number) : void {
            this.level = level;
            Lib.Save.getInstance().set(this.name, level);
        }

        /**
         * General logging class.
         * Logs a message with the fiven level
         *
         * @param level     The logging level
         * @param args      All the arguments after the level
         */
        public log(level : number, ...args : any[]) : void {
            if(level < this.level) { return; }

            for(var levelname in this.levels) {
                if(level <= this[levelname]) {
                    args.unshift('%c ' + this.name + ' ' + this.levels[levelname].text, this.levels[levelname].style);
                    break;
                }
            }

            if(level > this.ERROR) {
                console.error.apply(console, args);
            } else if (level > this.WARNING) {
                console.warn.apply(console, args);
            } else {
                console.log.apply(console, args);
            }

        }

        /**
         * Logs any number of arguments with the log level TEXT
         */
        public text(...args : any[]) : void {
            args.unshift(this.TEXT);
            this.log.apply(this, args);
        }

        /**
         * Logs any number of arguments with the log level DEBUG
         */
        public debug(...args : any[]) : void {
            args.unshift(this.DEBUG);
            this.log.apply(this, args);
        }

        /**
         * Logs any number of arguments with the log level INFO
         */
        public info(...args : any[]) : void {
            args.unshift(this.INFO);
            this.log.apply(this, args);
        }

        /**
         * Logs any number of arguments with the log level WARNING
         */
        public warning(...args : any[]) : void {
            args.unshift(this.WARNING);
            this.log.apply(this, args);
        }

        /**
         * Logs any number of arguments with the log level ERROR
         */
        public error(...args : any[]) : void {
            args.unshift(this.ERROR);
            this.log.apply(this, args);
        }

        /**
         * Log sany number of arguments with the log level FATAL
         */
        public fatal(...args : any[]) : void {
            args.unshift(this.FATAL);
            this.log.apply(this, args);
        }

        /**
         * Prints a small demo of all available log levels
         */
        public demo() : void {
            var level : number = this.level;
            this.level = this.TEXT;

            this.text('text');
            this.debug('debug');
            this.info('info');
            this.warning('warning');
            this.error('error');
            this.fatal('fatal');

            this.level = level;
        }

    }

}