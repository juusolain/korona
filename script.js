let vaccinationChart
let cachedData

let area = "Kaikki alueet"
let cumulative = true
let log = false

let cachedLabels
let cachedDatasets

const colors = [
    '#6666ff',
    '#66a3c2',
    '#66c2a3',
    '#66e085',
    '#66ff66',
    '#a3bd61',
    '#c29b5e',
    '#e07a5c',
    '#ff5959',
    '#d95c83',
    '#b360ac',
    '#8c63d6',
    '#433a61',
    '#613a58',
    '#613a3b',
    '#666'
]


function loadData(){
    fetch('/data/vaccines.json').then(function(res) {
        res.json().then(function(json) {
          cachedData = json
          setAreas()
          updateData()
        });
    });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function setAreas() {
    let areas = []
    let areaSelect = document.getElementById('areaSelect')
    _.forEach(cachedData, val => {
        const area = val.area
        if(!areas.includes(area)){
            areas.push(area)
            areaSelect.options.add( 
                new Option(area, area, (area === "Kaikki alueet"), (area === "Kaikki alueet")) 
            )
        }
    })
    areaSelect.onchange = (e)=>{
        area = e.target.value
        updateData()
    }
}

function prepCheckboxes() {
    let cumulativeBox = document.getElementById('cumulativeBox')
    let logBox = document.getElementById('logBox')
    // let predictBox = document.getElementById('predictBox')

    cumulativeBox.checked = cumulative
    logBox.checked = log

    cumulativeBox.onclick = (e) => {
        cumulative = e.target.checked
        updateData() // cumulative needs also data update
    }

    logBox.onclick = (e) => {
        log = e.target.checked
        updateChart() // update only chart
    }
}

function updateData() {
    let data = cachedData
    data = _.filter(data, (o)=>{
        return o.area === area
    })
    data = _.sortBy(data, 'dateweek20201226')
    data = _.groupBy(data, 'dateweek20201226')
    let times = []
    let datasets = []
    let colori = 0
    _.forOwn(data, (arr, key)=>{
        if(key === 'Kaikki ajat') return
        times.push(key)
        arr.forEach(row => {
            const age = row.cov_vac_age
            let value = Number(row.value)
            let dataset = _.find(datasets, (o)=>{
                return o.label === age 
            })
            if(!dataset){
                if(colori >= colors.length){
                    color = getRandomColor()
                }else{
                    color = colors[colori]
                    colori++
                }
                dataset = {
                    label: age,
                    data: [],
                    borderColor: color,
                    backgroundColor: color,
                    fill: false
                }
                
                datasets.push(dataset)
            }
            if(cumulative) {
                const last = dataset.data[dataset.data.length - 1] || 0
                value += last
            }
            dataset.data.push(value)
        });
    })
    cachedLabels = times
    cachedDatasets = datasets
    updateChart(times, datasets)
}


function updateChart(labels = cachedLabels, datasets = cachedDatasets){
    if(vaccinationChart){
        vaccinationChart.data.labels = labels
        vaccinationChart.data.datasets = datasets
        vaccinationChart.options.scales.yAxes[0].type = log ? 'logarithmic' : 'linear'
        vaccinationChart.update()
    }else{
        var ctx = document.getElementById('vaccinationChart').getContext('2d');
        vaccinationChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets,
                labels: labels
            },
            options: {
                legend: {
                    labels: {
                        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
                        fontColor: "#444",
                        fontSize: 16,
                        boxWidth: 50
                    }
                    
                },
                scales: {
                    yAxes: [{
                        type: log ? 'logarithmic' : 'linear'
                    }]
                }
                
            }
        });
    }
}

window.onload = () => {
    prepCheckboxes()
} 
loadData()
