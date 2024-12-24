// script.js

// Global variables
const chartCanvas = document.getElementById('chartCanvas');
let chart = null;
const outputDiv = document.getElementById('output');

// Event listener for the Run button
document.getElementById('runButton').addEventListener('click', () => {
    const selectedAlgorithm = document.getElementById('algorithmSelector').value;
    resetChart();

    if (selectedAlgorithm === 'kmeans') {
        runKMeans();
    } else if (selectedAlgorithm === 'svm') {
        runSVM();
    }
});

// Function: Reset Chart
function resetChart() {
    if (chart) chart.destroy();
    chart = null;
    outputDiv.innerHTML = "Output will appear here...";
}

// Function: K-Means Clustering
function runKMeans() {
    // Generate random data points
    const data = Array.from({ length: 50 }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 10,
    }));

    // K-Means logic with TensorFlow.js
    const k = 2; // Number of clusters
    const centroids = Array.from({ length: k }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 10,
    }));

    function assignClusters() {
        data.forEach(point => {
            const distances = centroids.map(c => Math.sqrt((point.x - c.x) ** 2 + (point.y - c.y) ** 2));
            point.cluster = distances.indexOf(Math.min(...distances));
        });
    }

    function updateCentroids() {
        for (let i = 0; i < k; i++) {
            const clusterPoints = data.filter(point => point.cluster === i);
            if (clusterPoints.length > 0) {
                centroids[i].x = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
                centroids[i].y = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
            }
        }
    }

    function runIteration(iteration = 0) {
        if (iteration >= 10) {
            outputDiv.innerHTML = "K-Means clustering completed!";
            return;
        }

        assignClusters();
        updateCentroids();
        drawKMeans(data, centroids);
        setTimeout(() => runIteration(iteration + 1), 500);
    }

    runIteration();
}

// Function: Draw K-Means Results
function drawKMeans(data, centroids) {
    const colors = ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'];
    chart = new Chart(chartCanvas, {
        type: 'scatter',
        data: {
            datasets: [
                ...centroids.map((c, i) => ({
                    label: `Cluster ${i + 1}`,
                    data: data.filter(point => point.cluster === i).map(point => ({ x: point.x, y: point.y })),
                    backgroundColor: colors[i],
                })),
                {
                    label: 'Centroids',
                    data: centroids.map(c => ({ x: c.x, y: c.y })),
                    backgroundColor: 'white',
                    pointRadius: 8,
                },
            ],
        },
        options: {
            plugins: { legend: { display: true } },
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true },
            },
        },
    });
}

// Function: Support Vector Machine (SVM)
function runSVM() {
    // Generate random binary classification data
    const data = Array.from({ length: 100 }, () => ({
        x: Math.random(),
        y: Math.random(),
        label: Math.random() > 0.5 ? 1 : 0,
    }));

    // Prepare data for TensorFlow.js
    const xs = tf.tensor2d(data.map(point => [point.x, point.y]));
    const ys = tf.tensor1d(data.map(point => point.label), 'int32');

    // Build and train the SVM model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid', inputShape: [2] }));
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    async function trainModel() {
        await model.fit(xs, ys, { epochs: 50 });
        drawSVM(model, data);
        outputDiv.innerHTML = "SVM training completed!";
    }

    trainModel();
}

// Function: Draw SVM Results
function drawSVM(model, data) {
    const colors = ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'];
    chart = new Chart(chartCanvas, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Class 0',
                    data: data.filter(p => p.label === 0).map(p => ({ x: p.x, y: p.y })),
                    backgroundColor: colors[0],
                },
                {
                    label: 'Class 1',
                    data: data.filter(p => p.label === 1).map(p => ({ x: p.x, y: p.y })),
                    backgroundColor: colors[1],
                },
            ],
        },
        options: {
            plugins: { legend: { display: true } },
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true },
            },
        },
    });
}
