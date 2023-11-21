
const ctx2 = document.getElementById('eChart').getContext('2d');
const eChart = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Transaction',
            data: [],
            backgroundColor: function(context) {
                const index = context.dataIndex;
                const value = context.dataset.data[index];
                return value < 0 ? 'red' :  // draw negative values in red
                    'green';
            },
            borderwidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                BeginAtZero: true
            }
        }
    }
});

function addData(chart) {
    chart.data.labels.push(document.getElementById("date").value);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(document.getElementById("amount").value * 1);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}