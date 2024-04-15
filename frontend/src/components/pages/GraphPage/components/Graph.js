import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Modal from './Modal';
import styles from "../GrapghePage.module.scss";

const Graph = ({ data }) => {
    const svgRef = useRef(null);
    const [modalText, setModalText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {

        if (!data) return; // Return if data is not available

        // Clear existing SVG content
        d3.select(svgRef.current).selectAll("*").remove();
        const width = 2880;
        const height = 1620;
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        let nodeSize = 50;
        let linkLength = 15;
        let linkLabelSize = 25;

        const links = data.links.map(d => ({ ...d }));
        const nodes = data.nodes.map(d => ({ ...d })).map(node => ({
            ...node,
            labelWidth: node.weight * nodeSize * 1.4,
            labelHeight: node.weight * nodeSize * 1.4
        }));

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id)
                .distance(d => {
                    const sourceRadius = d.source.weight * nodeSize;
                    const targetRadius = d.target.weight * nodeSize;
                    const baseDistance = 100;
                    const distance = Math.max(baseDistance, d.label.length * linkLength) + sourceRadius + targetRadius;
                    return distance;
                }))
            .force("charge", d3.forceManyBody().strength(-35000))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        svg.append("defs").selectAll("marker")
            .data(["end"])
            .enter().append("marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 0)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .attr("opacity", 0.2)
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#999");
        const initialScale = 0.6; // Initial scale for zooming out

        const zoom = d3.zoom()
            .scaleExtent([0.1, 80])
            .on("zoom", zoomed);
        svg.call(zoom);
        // Trigger the zoom event programmatically to zoom out
        svg.call(zoom.transform, d3.zoomIdentity.scale(initialScale));


        function zoomed(event) {
            svg.selectAll('g.nodes, g.links').attr("transform", event.transform);
        }

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${-width / 2 + 10}, ${-height / 2 + 50})`);

        const groupNames = [...new Set(nodes.map(d => d.group))];

        const legendEntries = legend.selectAll("g")
            .data(groupNames)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 40})`);

        legendEntries.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d => color(d));

        legendEntries.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .text(d => d)
            .style("font-size", "26px");

        const linkGroup = svg.append("g").attr("class", "links");
        const link = linkGroup.selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => d.weight * 4)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.2)
            .attr("marker-end", "url(#end)");

        const linkText = linkGroup.selectAll("text.link-label")
            .data(links)
            .enter().append("text")
            .attr("class", "link-label")
            .attr("text-anchor", "middle")
            .attr("fill", "#555")
            .style("font-size", linkLabelSize)
            .text(d => d.label)
            .on("click", (event, d) => handleLinkTextClick(event, d)); // Pass event and data to handleLinkTextClick

        const nodeGroup = svg.append("g").attr("class", "nodes");
        const node = nodeGroup.selectAll("g.node-group")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node-group")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", d => d.weight * nodeSize)
            .attr("fill", d => color(d.group))

        node.append("foreignObject")
            .attr("class", "node-foreignObject")
            .attr("x", d => -d.labelWidth / 2)
            .attr("y", d => -d.labelHeight / 2)
            .attr("width", d => d.labelWidth)
            .attr("height", d => d.labelHeight)
            .append("xhtml:div")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("height", "100%")
            .style("word-wrap", "break-word")
            .style("text-align", "center")
            .style("max-width", d => `${d.labelWidth}px`)
            .style("color", "white")
            .style("font-weight", "bold")
            .html(d => d.label)
            .each(function (d) {
                adjustTextSize(this, Math.round(d.labelWidth), Math.round(d.labelHeight));
            });

        function adjustTextSize(textElement, maxWidth, maxHeight) {
            let div = d3.select(textElement);
            let fontSize = 10;
            div.style("font-size", `${fontSize}px`);
            let textWidth = Math.round(div.node().scrollWidth);
            let textHeight = Math.round(div.node().scrollHeight);

            while ((textWidth > maxWidth || textHeight > maxHeight) && fontSize > 1) {
                fontSize--;
                div.style("font-size", `${fontSize}px`);
                textWidth = div.node().scrollWidth;
                textHeight = div.node().scrollHeight;
            }

            while (textWidth <= maxWidth && textHeight <= maxHeight && fontSize < 240) {
                fontSize++;
                div.style("font-size", `${fontSize + 1}px`);
                textWidth = div.node().scrollWidth;
                textHeight = div.node().scrollHeight;
                if (textWidth > maxWidth || textHeight > maxHeight) {
                    div.style("font-size", `${fontSize}px`);
                    break;
                }
            }
        }

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x - ((d.target.weight * nodeSize + 40) / Math.sqrt((d.target.x - d.source.x) ** 2 + (d.target.y - d.source.y) ** 2) * (d.target.x - d.source.x)))
                .attr("y2", d => d.target.y - ((d.target.weight * nodeSize + 40) / Math.sqrt((d.target.x - d.source.x) ** 2 + (d.target.y - d.source.y) ** 2) * (d.target.y - d.source.y)));

            node.attr("transform", d => `translate(${d.x},${d.y})`);

            linkText
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2)
                .attr("transform", d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    const x = (d.source.x + d.target.x) / 2;
                    const y = (d.source.y + d.target.y) / 2;

                    if (angle > 90 || angle < -90) {
                        angle = angle + 180;
                    }

                    return `rotate(${angle},${x},${y})`;
                });

            node.selectAll(".node-foreignObject > div").each(function (d) {
                adjustTextSize(this, d.labelWidth, d.labelHeight);
            });
        });

        function adjustTextSize(textElement, maxWidth, maxHeight) {
            let div = d3.select(textElement);
            let fontSize = 10;
            div.style("font-size", `${fontSize}px`);
            let textWidth = Math.round(div.node().scrollWidth);
            let textHeight = Math.round(div.node().scrollHeight);

            while ((textWidth > maxWidth || textHeight > maxHeight) && fontSize > 1) {
                fontSize--;
                div.style("font-size", `${fontSize}px`);
                textWidth = div.node().scrollWidth;
                textHeight = div.node().scrollHeight;
            }

            while (textWidth <= maxWidth && textHeight <= maxHeight && fontSize < 240) {
                fontSize++;
                div.style("font-size", `${fontSize + 1}px`);
                textWidth = div.node().scrollWidth;
                textHeight = div.node().scrollHeight;
                if (textWidth > maxWidth || textHeight > maxHeight) {
                    div.style("font-size", `${fontSize}px`);
                    break;
                }
            }
        }

    }, []);

    const handleDownloadSVG = () => {
        const svgElement = svgRef.current;
        const svgCopy = svgElement.cloneNode(true); // Create a deep copy of the SVG element
        const serializer = new XMLSerializer();

        // Remove zoom transformation
        const zoomTransform = svgCopy.createSVGTransform();
        zoomTransform.setTranslate(0, 0);
        svgCopy.transform.baseVal.initialize(zoomTransform);

        const svgString = serializer.serializeToString(svgCopy);

        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadJSON = () => {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    function handleLinkTextClick(event, d) {
        // Display popup/modal with the text
        setModalText(d.label);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    return (
        <div>
            <div className={styles.downloadButtonsContainer}>
                <button className={styles.downloadButton} onClick={handleDownloadSVG}>Download SVG</button>
                <button className={styles.downloadButton} onClick={handleDownloadJSON}>Download JSON</button>
            </div>
            <svg ref={svgRef}></svg>
            <Modal isOpen={isModalOpen} text={modalText} onClose={handleCloseModal} />

        </div>
    );

};

export default Graph;
