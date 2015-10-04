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

    interface IData {
        labelMap : {[name : number] : number};
        pictureMap : {[name : number] : number};
        pictureLinkMap : {[name : number] : number};
        nodes : INode[];
        links : any[];
    }

    export class Graph {

        private force : d3.layout.Force<any, any>;
        private width : number;
        private height : number;
        private pictures : IPicture[];
        private svg;
        private labelNum : number;

        private maxPerCircle : number = 6;

        private innerCircle : number = 150;
        private circleSize : number = 170;
        private outerCircle : number = 320;

        private data : IData = {
            labelMap: {},
            pictureMap: {},
            pictureLinkMap: {},
            nodes: [],
            links: []
        }

        public constructor(selector : string) {
            this.svg = d3.select(selector);

            var n : HTMLElement = <HTMLElement>document.querySelector(selector);
            this.width = n.clientWidth;
            this.height = n.clientHeight;

            this.svg.attr("width", this.width);
            this.svg.attr('height', this.height);

            this.force = d3.layout.force()
                            .gravity(.1)
                            .linkStrength(.1)
                            .friction(.8)
                            .theta(.5)
                            .linkDistance(0)
                            .size([this.width, this.height]);

            var node = this.svg.selectAll(".node")
            var link = this.svg.selectAll(".link")



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


        }

        public setPictures(data : IPicture[]) : void {
            this.pictures = data;
            this.redraw();
        }

        public update(picture : number, label : number) {
            var realPicture : number = this.data.pictureMap[picture];
            var realLabel : number = this.data.labelMap[label];

            var previousLabel : number = this.data.links[this.data.pictureLinkMap[picture]].source.label;
            if(previousLabel === null) return;
            this.data.links[this.data.pictureLinkMap[picture]].source = realPicture;
            this.data.links[this.data.pictureLinkMap[picture]].target = realLabel;

            this.force.links(this.data.links).start();

            var link = this.svg.selectAll(".link");
            link.data(this.data.links)
                .enter()
                .insert('line', '.node')
                .attr('class', 'link')

            setTimeout(() => {
                $(".drawingMiddle img").attr("src", "/img/img/" + picture + ".jpg");
                $(".drawingMiddle .newCategoryText").text("new Label: " + Util.LabelUtil.labels[label]);

                log.debug('Graph.update', 'move', picture, previousLabel, '=>', label);
                log.text('Graph.update', 'adding class shown');
                $(".drawingMiddle").addClass("shown");
                setTimeout(() => {
                    log.text('Graph.update', 'removing class shown');
                    $(".drawingMiddle").removeClass("shown")
                }, 1000)
            }, 500)

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

        public redraw() : void {

            // pictures added
            var _picturesAdded = [];
            // labels added
            var _labelsAdded = [];
            // label map: map of labels to node ids

            var colors : any = d3.scale.category10();
            this.pictures.forEach((d : IPicture) => {
                if(_labelsAdded.indexOf(d.label) === -1) {
                    this.data.labelMap[d.label] = this.data.nodes.length;
                    this.data.nodes.push({name: d.label.toString(), label: _labelsAdded.length, parent: null, color: colors(d.label)});
                    _labelsAdded.push(d.label);
                }
                if(_picturesAdded.indexOf(d.id) === -1) {
                    this.data.pictureMap[d.id] = this.data.nodes.length;
                    this.data.nodes.push({name: d.id.toString(), label: null, parent: null, parentLabel: this.data.labelMap[d.label], color: colors(d.label) });
                    _picturesAdded.push(d.id);
                }
                this.data.pictureLinkMap[d.id] = _picturesAdded.length-1;
                this.data.links.push({source: this.data.labelMap[d.label], target: this.data.pictureMap[d.id], color: colors(d.label)});
            });
            this.labelNum = _labelsAdded.length-1;


            this.force
                .nodes(this.data.nodes)
                .links(this.data.links)
                .start();

            var link = this.svg.selectAll(".link")
                .data(this.data.links)
                .enter().append("line")
                .attr("class", "link")
                .style('stroke', function(d) { return d.color; });

            var node = this.svg.selectAll(".node")
                .data(this.data.nodes)
                .enter().append("circle")
                .attr("class", function(d : IPicturePoint) { return d.label !== null ? 'node label' : 'node' })
                .attr("r", function(d) { return d.label !== null ? 15 : 4 })
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