///<reference path="Lib/Graph"/>
///<reference path="Lib/Cards"/>

if(window['view'] === 'index') {
    var graph = new Lib.Graph('#drawing_area');
    graph.setData([
        {
            id: 6,
            label: 3
        }, {
            id: 2,
            label: 3
        }, {
            id: 1,
            label: 3
        }, {
            id: 9,
            label: 6
        }, {
            id: 15,
            label: 6
        }, {
            id: 23,
            label:20
        }, {
            id: 24,
            label: 20
        }, {
            id: 25,
            label: 20
        }, {
            id: 26,
            label: 20
        }
    ]);
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
}