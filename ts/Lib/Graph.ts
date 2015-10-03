///<reference path="../../typings/tsd.d.ts"/>


module Lib {

    export interface IPicture {
        id : number;
        label : number;
    }

    interface IPicturePoint extends IPicture {
        x : number;
        y : number;
        parentLabel? : number;
    }

    interface INode extends d3.layout.bundle.Node {
        name : string;
        label : number;
        parentLabel? : number;
    }

    interface ICoordinates {
        x : number;
        y : number;
    }

    export class Graph {

        private force : d3.layout.Force<any, any>;
        private width : number;
        private height : number;
        private data : IPicture[];
        private svg;
        private labelNum : number;
        private circleSize : number = 200;

        public constructor(selector : string) {
            this.svg = d3.select(selector);

            var node : HTMLElement = <HTMLElement>document.querySelector(selector);
            this.width = node.clientWidth;
            this.height = node.clientHeight;

            this.svg.attr("width", this.width);
            this.svg.attr('height', this.height);

            this.force = d3.layout.force()
                            .alpha(10)
                            .linkDistance(200)
                            .size([this.width, this.height]);

        }

        public setData(data : IPicture[]) : void {
            this.data = data;
            this.redraw();
        }

        private getLabelPointCoordinates(p : IPicturePoint) : ICoordinates {
            return {
                x: Math.cos(p.label / this.labelNum * Math.PI) * this.circleSize + window.innerWidth/2,
                y: Math.sin(p.label / this.labelNum * Math.PI) * this.circleSize + window.innerHeight/2
            }
        }

        private isInCircle(point : ICoordinates) : boolean {
            return (
                Math.abs(window.innerHeight / 2 - point.y) < this.circleSize / 2 ||
                Math.abs(window.innerWidth / 2 - point.x) < this.circleSize / 2
            );
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

            this.svg.append('circle')
                .attr('cx', window.innerWidth/2)
                .attr('cy', window.innerHeight/2)
                .attr('r', this.circleSize)
                .attr('class', 'middle')

            this.data.forEach((d : IPicture) => {
                if(_labelsAdded.indexOf(d.label) === -1) {
                    labelMap[d.label] = nodes.length;
                    nodes.push({name: d.label.toString(), label: _labelsAdded.length, parent: null});
                    _labelsAdded.push(d.label);
                }
                if(_picturesAdded.indexOf(d.id) === -1) {
                    pictureMap[d.id] = nodes.length;
                    nodes.push({name: d.id.toString(), label: null, parent: null, parentLabel: labelMap[d.label]});
                    _picturesAdded.push(d.id);
                }
                links.push({source: labelMap[d.label], target: pictureMap[d.id]});
            });
            this.labelNum = _labelsAdded.length-1;

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
                .attr("class", "link");

            var node = this.svg.selectAll(".node")
                .data(nodes)
                .enter().append("circle")
                .attr("class", function(d : IPicturePoint) { return d.label !== null ? 'node label' : 'node' })
                .attr("r", function(d) { return d.label !== null ? 15 : 5 })
                .call(this.force.drag);

            node.append("title")
                .text(function(d) { return d.name; });

            this.force.on("tick", () => {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", (d : IPicturePoint) => {
                    if(d.label !== null) {
                        d.x = this.getLabelPointCoordinates(d).x;
                    } /* else if (this.isInCircle({x: d.x, y: d.y})) {
                        var parentX = this.getLabelPointCoordinates(<IPicturePoint>nodes[d.parentLabel]).x;
                        if(d.x > parentX) {d.x -= Math.abs(d.y - parentX) * 2} else {d.x += Math.abs(d.y - parentX)}
                    } */
                    return d.x;
                })
                    .attr("cy", (d : IPicturePoint) => {
                        if(d.label !== null) {
                            console.log(d, this.labelNum, this.circleSize);
                            d.y = this.getLabelPointCoordinates(d).y
                        } /*else if (this.isInCircle({x: d.x, y: d.y})) {
                            var parentY = this.getLabelPointCoordinates(<IPicturePoint>nodes[d.parentLabel]).y;
                            if(d.y > parentY) {d.y -= Math.abs(d.y - parentY) * 2} else {d.y += Math.abs(d.y - parentY)};
                        } */
                        return d.y;
                    });
            });
        }

    }

}