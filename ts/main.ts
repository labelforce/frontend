///<reference path="Lib/Graph"/>
///<reference path="Lib/Cards"/>
///<reference path="Lib/Logger"/>
///<reference path="Lib/Leveling"/>
///<reference path="Util/FirebaseUtil"/>

var log : Lib.Logger = new Lib.Logger('labelforce');

interface IDataAnswer {
    [name : string] : number;
}

if(window['view'] === 'index') {

    Util.FirebaseUtil.getFirebase('net').then((firebase : Firebase) => {
        var graph : Lib.Graph = new Lib.Graph('#drawing_area');
        firebase.once('value', (value : any) => {
            log.debug('VALUE', value.val());
            var datas : {[name : string] : IDataAnswer} = value.val();
             var data : Lib.IPicture[] = [];

            var ids : string[] = [];
             for(var j in datas) {
                var prefixedId : string = Object.keys(datas[j])[0];
                 if(ids.indexOf(prefixedId) > -1) {continue;}
                 ids.push(prefixedId);
                 data.push({
                     id: parseInt(prefixedId.substr(1)),
                     label: datas[j][prefixedId]
                 })
             }

             graph.setPictures(data);

            var check : boolean = false;
            firebase.on('child_added', (value : any) => {
                if(check) {
                    var v : IDataAnswer = value.val();
                    var prefixedId : string = Object.keys(v)[0];
                     log.debug(v);
                     graph.update(parseInt(prefixedId.substr(1)), v[prefixedId]);
                }
            });
            setTimeout(() => {check = true;log.info('let the checking beginn')}, 4000)
        });
    });


    setTimeout(() => {
        $(".intro").addClass("gone")
    }, 8000);
/*    var graph = new Lib.Graph('#drawing_area');
    var data = [];
    var j = 0;
    for(var i = 0; i < 10; i++) {
        for(var h = 0; h < 50; h++) {
            data.push({id: j++, label: i});
        }
    }
   graph.setPictures(data);

    setInterval(() => {
        graph.update(Math.round(Math.random() * data.length), Math.round(Math.random() * 9));
    }, 5000);*/
}

if(window['view'] === 'swipe') {
    Util.FirebaseUtil.getFirebase('labelme').then((firebase : Firebase) => {
        var cards = new Lib.Cards({
            wrapper: '.swipe'
        });
        var leveling : Lib.Leveling = new Lib.Leveling(cards);

        firebase.once('value', (value : any) => {
            var datas : {[name : string] : IDataAnswer} = value.val();

            log.info('labelme',datas);

            var data : Lib.IPicture[] = [];
            for(var l in datas) {
                var prefixedId : string = Object.keys(datas[l])[0];
                data.push({
                    id: parseInt(prefixedId.substr(1)),
                    label: datas[l][prefixedId]
                })
            }

            cards.setItems(data);
            cards.update();

            var check : boolean = false;
            firebase.on("child_added", (item : any) => {
                if(check) {
                    log.debug(item.val());
                }
            });
            setTimeout(() => {check = true; log.info("let the checking begin")}, 3000);
        });
    });
/*
    var cards = new Lib.Cards({
        wrapper: '.swipe'
    });
    cards.setItems([
        {
            id: 56,
            label: 12
        }, {
            id: 77,
            label: 1
        }, {
            id: 159,
            label: 3
        }, {
            id: 8436,
            label:66
        }
    ]);
    cards.update();
    var leveling : Lib.Leveling = new Lib.Leveling(cards);*/
}