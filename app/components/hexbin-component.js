import D3Base from './d3-base';
import d3 from 'd3';
import d3Hexbin from 'd3-hexbin';

export default D3Base.extend({
  tagName: 'svg',
  attributeBindings: ['svgWidth:width', 'svgHeight:height'],

  svg: null,
  svgWidth: 960,
  svgHeight: 500,
  width: null,
  height: null,
  margin: null,
  top: 20,
  right: 20,
  bottom: 30,
  left: 40,
  points: null,
  range: 2000,
  radius: 20,

  didInsertElement() {
    this._super(...arguments);

    this.setLayout();
    this.setBaseProperties();
    this.setColor();
    this.setHexbin();
    this.setPlane();
    this.buildChart();
  },

  setLayout() {
    const {
      top,
      right,
      bottom,
      left,
    } = this.getProperties(
      'top',
      'right',
      'bottom',
      'left',
    );

    const svg = d3.select('svg'),
          margin = { top, right, bottom, left },
          width = +svg.attr('width') - margin.left - margin.right,
          height = +svg.attr('height') - margin.top - margin.bottom,
          g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.setProperties({
      svg,
      width,
      height,
      g,
    });
  },

  setBaseProperties() {
    const {
      height,
      width,
      range,
    } = this.getProperties(
      'height',
      'width',
      'range',
    );
    const randomX = d3.randomNormal(width / 2, 80),
          randomY = d3.randomNormal(height / 2, 80),
          points = d3.range(range).map(() => [randomX(), randomY()]);

    this.set('points', points);
  },

  setColor() {
    const color = d3.scaleSequential(d3.interpolateLab('white', 'steelblue'))
                  .domain([0, 20]);

    this.set('color', color);
  },

  setHexbin() {
    const {
      height,
      width,
      radius,
    } = this.getProperties(
      'height',
      'width',
      'radius',
    );
    const hexbin = d3Hexbin.hexbin()
      .radius(radius)
      .extent([[0,0], [width, height]]);

    this.set('hexbin', hexbin);
  },

  setPlane() {
    const {
      height,
      width,
    } = this.getProperties(
      'height',
      'width',
    );
    const x = d3.scaleLinear()
              .domain([0, width])
              .range([0, width]),
          y = d3.scaleLinear()
              .domain([0, height])
              .range([height, 0]);

    this.setProperties({ x, y });
  },

  buildChart() {
    const {
      height,
      width,
      points,
      color,
      hexbin,
      g,
      x,
      y,
    } = this.getProperties(
      'height',
      'width',
      'points',
      'color',
      'hexbin',
      'g',
      'x',
      'y',
    );

    g.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    g.append('g')
      .attr('class', 'hexagon')
      .attr('clip-path', 'url(#clip)')
      .selectAll('path')
      .data(hexbin(points))
      .enter().append('path')
      .attr('d', hexbin.hexagon())
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .attr('fill', (d) => color(d.length));

    g.append('g')
      .attr('class', 'axis axis--y')
      .attr(d3.axisLeft(y).tickSizeOuter(-width));

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(-height));
  },
});
