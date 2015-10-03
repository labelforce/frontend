///<reference path="Lib/Graph"/>
///<reference path="Lib/Cards"/>
///<reference path="Lib/Logger"/>
///<reference path="Lib/Leveling"/>

var log : Lib.Logger = new Lib.Logger('labelforce');

if(window['view'] === 'index') {
/*
    var firebase = new Firebase('https://boiling-heat-2521.firebaseio.com/net');
    firebase.authWithCustomToken('eoyakpIFmf4LTm6JcUPElixc8ieeQujvDF7bCGNh', () => {
        firebase.once('value', (value : any) => {
            var datas : {[hash : string] : number}[] = value.val();

            var data = [];
            for(var i : number = 0; i < datas.length; i++) {
                var key : string = Object.keys(datas[i])[0];
                data.push({id: i, label: datas[i][key]});
            }

            var graph : Lib.Graph = new Lib.Graph('#drawing_area');
            graph.setPictures(data);
        });
    });


    setTimeout(() => {
        $(".intro").addClass("gone")
    }, 8000);*/
    var graph = new Lib.Graph('#drawing_area');
    var data = [];
    var j = 0;
    for(var i = 0; i < 10; i++) {
        for(var h = 0; h < 200; h++) {
            data.push({id: j++, label: i});
        }
    }
   graph.setPictures(data);

    setInterval(() => {
        graph.update(Math.round(Math.random() * data.length), Math.round(Math.random() * 9));
    }, 5000);
}

if(window['view'] === 'swipe') {
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
    var leveling : Lib.Leveling = new Lib.Leveling(cards);
}