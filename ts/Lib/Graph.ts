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
        color? : string;
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

        private maxPerCircle : number = 6;

        private innerCircle : number = 150;
        private circleSize : number = 170;
        private outerCircle : number = 320;

        public constructor(selector : string) {
            this.svg = d3.select(selector);

            var node : HTMLElement = <HTMLElement>document.querySelector(selector);
            this.width = node.clientWidth;
            this.height = node.clientHeight;

            this.svg.attr("width", this.width);
            this.svg.attr('height', this.height);

            this.force = d3.layout.force()
                            .gravity(0)
                            .friction(.9)
                            .theta(.5)
                            .linkDistance(90)
                            .size([this.width, this.height]);

        }

        public setData(data : IPicture[]) : void {
            this.data = data;
            this.redraw();
        }

        private getLabelPointCoordinates(p : IPicturePoint) : ICoordinates {
            var circleSize : number = this.circleSize;
            var percentage : number = p.label / this.labelNum;
            if(p.label >= this.maxPerCircle) {
                circleSize = this.outerCircle;
                percentage = p.label / (this.labelNum - this.maxPerCircle + 1) + .125 * Math.PI;
            } else if (this.labelNum >= this.maxPerCircle) {
                percentage = p.label / this.maxPerCircle;
            }

            // preprocess
            percentage -=  Math.PI/2;

            return {
                x: Math.cos(percentage * Math.PI * 2) * circleSize + window.innerWidth/2,
                y: Math.sin(percentage * Math.PI * 2) * circleSize + window.innerHeight/2
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
                .attr('class', 'middle');


            this.svg.append('circle')
                .attr('cx', window.innerWidth/2)
                .attr('cy', window.innerHeight/2)
                .attr('r', this.innerCircle)
                .attr('class', 'middle');


            this.svg.append('circle')
                .attr('cx', window.innerWidth/2)
                .attr('cy', window.innerHeight/2)
                .attr('r', this.outerCircle)
                .attr('class', 'middle');

            var colors : any = d3.scale.category10();
            this.data.forEach((d : IPicture) => {
                if(_labelsAdded.indexOf(d.label) === -1) {
                    labelMap[d.label] = nodes.length;
                    nodes.push({name: d.label.toString(), label: _labelsAdded.length, parent: null, color: colors(_labelsAdded.length)}); // TODO
                    _labelsAdded.push(d.label);
                }
                if(_picturesAdded.indexOf(d.id) === -1) {
                    pictureMap[d.id] = nodes.length;
                    nodes.push({name: d.id.toString(), label: null, parent: null, parentLabel: labelMap[d.label], color: '#fff' });
                    _picturesAdded.push(d.id);
                }
                links.push({source: labelMap[d.label], target: pictureMap[d.id], color: colors(_labelsAdded.length-1)});
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
                .attr("class", "link")
                .style('stroke', function(d) { console.log(d); return d.color; });

            var node = this.svg.selectAll(".node")
                .data(nodes)
                .enter().append("circle")
                .attr("class", function(d : IPicturePoint) { return d.label !== null ? 'node label' : 'node' })
                .attr("r", function(d) { return d.label !== null ? 15 : 5 })
                .style('stroke', function(d) { return d.color })
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