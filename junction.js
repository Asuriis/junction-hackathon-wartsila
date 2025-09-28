const tbody = document.getElementById('energyTableBody');
const ctx = document.getElementById('energyChart').getContext('2d');
const chartTypeSelector = document.getElementById('chartType');

let currentChart;

// Load wind turbine data
fetch('junction.json')
  .then(response => response.json())
  .then(data => {
    // Sort by time for line chart
    data.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Populate table
    data.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.device}</td>
        <td>${entry.output_kw}</td>
        <td>${entry.temp_C}</td>
        <td>${entry.wind_speed}</td>
        <td>${entry.position}</td>
        <td>${entry.time}</td>
      `;
      tbody.appendChild(row);
    });

    // Initial chart
    renderOutputOverTimeChart(data);

    // Listen for chart type change
    chartTypeSelector.addEventListener('change', () => {
      if (currentChart) currentChart.destroy();
      if (chartTypeSelector.value === 'time') {
        renderOutputOverTimeChart(data);
      } else {
        renderOutputVsWindSpeedChart(data);
      }
    });
  })
  .catch(error => {
    console.error('Error loading turbine data:', error);
  });

// Chart 1: Output over time
function renderOutputOverTimeChart(data) {
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.time),
      datasets: [{
        label: 'Turbine Output (kW)',
        data: data.map(d => d.output_kw),
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46,125,50,0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Wind Turbine Output Over Time'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: 'Output (kW)' }
        },
        x: {
          title: { display: true, text: 'Time' }
        }
      }
    }
  });
}

// Chart 2: Output vs Wind Speed (scatter)
function renderOutputVsWindSpeedChart(data) {
  const scatterData = data.map(entry => ({
    x: entry.wind_speed,
    y: entry.output_kw,
    label: entry.device
  }));

  currentChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Output vs Wind Speed',
        data: scatterData,
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
        borderColor: '#2196f3',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const point = context.raw;
              return `Device: ${point.label}, Wind: ${point.x} m/s, Output: ${point.y} kW`;
            }
          }
        },
        title: {
          display: true,
          text: 'Wind Turbine Output vs Wind Speed'
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Wind Speed (m/s)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Output (kW)'
          }
        }
      }
    }
  });
}
