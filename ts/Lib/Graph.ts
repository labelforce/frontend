///<reference path="../../typings/tsd.d.ts"/>


module Lib {

    export interface IPictures {
        id : number;
        label : number;
    }

    interface INode extends d3.layout.bundle.Node {
        name : string;
        label : boolean;
    }

    export class Graph {

        private force : d3.layout.Force<any, any>;
        private width : number;
        private height : number;
        private data : IPictures[];
        private svg;

        public constructor(selector : string) {
            this.svg = d3.select(selector);

            var node : HTMLElement = <HTMLElement>document.querySelector(selector);
            this.width = node.clientWidth;
            this.height = node.clientHeight;

            this.svg.attr("width", this.width);
            this.svg.attr('height', this.height);

            this.force = d3.layout.force()
                            .charge(10)
                            .linkDistance(200)
                            .size([this.width, this.height]);

        }

        public setData(data : IPictures[]) : void {
            this.data = data;
            this.redraw();
        }

        public redraw() : void {

            // nodes added to the graph
            var nodes : INode[] = [];
            // pictures added
            var _picturesAdded = [];
            // labels added
            var _labelsAdded = [];
            // label map: map of labels to node ids
            var labelMap : {[from : number] : number}= {};
            var pictureMap : {[from : number] : number} = {};
            // the links
            var links : any[] = [];

            this.data.forEach((d : IPictures) => {
                if(_labelsAdded.indexOf(d.label) === -1) {
                    labelMap[d.label] = nodes.length;
                    nodes.push({name: d.label.toString(), label: true, parent: null});
                    _labelsAdded.push(d.label);
                }
                if(_picturesAdded.indexOf(d.id) === -1) {
                    pictureMap[d.id] = nodes.length;
                    nodes.push({name: d.id.toString(), label: false, parent: null});
                    _picturesAdded.push(d.id);
                }
                links.push({source: labelMap[d.label], target: pictureMap[d.id]});
            });

            console.log({
                nodes: nodes,
                links: links
            });


            this.force
                .nodes(nodes)
                .links(links)
                .start();

            var link = this.svg.selectAll(".link")
                .data(links)
                .enter().append("line")
                .attr("class", "link")

            var node = this.svg.selectAll(".node")
                .data(nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", function(d) { return d.label ? 15 : 5 })
                .call(this.force.drag);

            this.force.on("tick", function() {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });
        }

    }

}