import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const DataVisualizations = ({ participants }) => {
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const genderChartRef = useRef(null);
  const stateChartRef = useRef(null);

  useEffect(() => {
    const createVisualizationsWrapper = () => {
      if (typeof window.d3 === 'undefined' || participants.length === 0) return;
      createVisualizations();
    };

    // Load D3 if not already loaded
    if (typeof window.d3 === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.onload = () => {
        if (participants.length > 0) {
          createVisualizationsWrapper();
        }
      };
      document.head.appendChild(script);
    } else {
      if (participants.length > 0) {
        createVisualizationsWrapper();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  const createVisualizations = () => {
    if (typeof window.d3 === 'undefined' || participants.length === 0) return;

    const d3 = window.d3;

    // Clear previous charts
    d3.select(pieChartRef.current).selectAll("*").remove();
    d3.select(barChartRef.current).selectAll("*").remove();
    d3.select(genderChartRef.current).selectAll("*").remove();
    d3.select(stateChartRef.current).selectAll("*").remove();

    // 1. Yatri Type Distribution (Pie Chart)
    createPieChart(d3);

    // 2. Top States (Bar Chart)
    createStateBarChart(d3);

    // 3. Gender Distribution (Donut Chart)
    createGenderChart(d3);

    // 4. Education Levels (Horizontal Bar Chart)
    createEducationChart(d3);
  };

  const createPieChart = (d3) => {
    const typeData = d3.rollups(
      participants,
      v => v.length,
      d => d.yatri_type
    ).map(([key, value]) => ({ type: key, count: value }));

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(pieChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(typeData.map(d => d.type))
      .range(['#1976d2', '#dc004e', '#ff9800', '#4caf50']);

    const pie = d3.pie()
      .value(d => d.count);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius - 10);

    const arcs = g.selectAll('arc')
      .data(pie(typeData))
      .enter()
      .append('g');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.type))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1.05)');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
      });

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text(d => d.data.count);

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(typeData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => color(d.type));

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .attr('font-size', '12px')
      .text(d => `${d.type} (${d.count})`);
  };

  const createStateBarChart = (d3) => {
    const stateData = d3.rollups(
      participants,
      v => v.length,
      d => d.state
    )
    .map(([key, value]) => ({ state: key, count: value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 states

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const svg = d3.select(barChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
      .domain(stateData.map(d => d.state))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stateData, d => d.count)])
      .range([height, 0]);

    g.selectAll('.bar')
      .data(stateData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.state))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', '#1976d2')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#dc004e');
        
        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '5px')
          .style('border-radius', '5px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.transition()
          .duration(200)
          .style('opacity', 1);

        tooltip.html(`${d.state}: ${d.count} participants`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('fill', '#1976d2');
        d3.selectAll('.tooltip').remove();
      });

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('font-size', '10px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Number of Participants');
  };

  const createGenderChart = (d3) => {
    const genderData = d3.rollups(
      participants,
      v => v.length,
      d => d.gender
    ).map(([key, value]) => ({ gender: key, count: value }));

    const width = 250;
    const height = 250;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    const svg = d3.select(genderChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(genderData.map(d => d.gender))
      .range(['#ff9800', '#4caf50', '#9c27b0']);

    const pie = d3.pie()
      .value(d => d.count);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10);

    const arcs = g.selectAll('arc')
      .data(pie(genderData))
      .enter()
      .append('g');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.gender))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text(d => d.data.count);

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('dy', '0.35em')
      .text('Gender');
  };

  const createEducationChart = (d3) => {
    const educationData = d3.rollups(
      participants,
      v => v.length,
      d => d.education
    )
    .map(([key, value]) => ({ education: key, count: value }))
    .sort((a, b) => b.count - a.count);

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(stateChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(educationData, d => d.count)])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(educationData.map(d => d.education))
      .range([0, height])
      .padding(0.1);

    g.selectAll('.bar')
      .data(educationData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.education))
      .attr('width', d => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', '#4caf50');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('font-size', '10px');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));
  };

  if (participants.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available for visualization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload participant data to see charts and analytics
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Data Analytics & Visualizations
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Interactive charts showing participant demographics and distribution
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Participant Types
            </Typography>
            <Box ref={pieChartRef} sx={{ textAlign: 'center' }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top States
            </Typography>
            <Box ref={barChartRef} sx={{ textAlign: 'center' }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gender Distribution
            </Typography>
            <Box ref={genderChartRef} sx={{ textAlign: 'center' }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Education Levels
            </Typography>
            <Box ref={stateChartRef} sx={{ textAlign: 'center' }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataVisualizations;