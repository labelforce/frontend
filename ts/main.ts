///<reference path="Lib/Graph"/>
///<reference path="Lib/Cards"/>
///<reference path="Lib/Logger"/>
///<reference path="Lib/Leveling"/>

var log : Lib.Logger = new Lib.Logger('labelforce');

if(window['view'] === 'index') {
    var graph = new Lib.Graph('#drawing_area');
    var data = [];
    var j = 0;
    for(var i = 0; i < 10; i++) {
        for(var h = 0; h < 100; h++) {
            data.push({id: j++, label: i});
        }
    }
    graph.setData(data);
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