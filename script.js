let caseChart
let vaccinationChart

let cachedCases
let cachedVaccine

let cachedVaccineLabels
let cachedVaccineDatasets

let cachedCaseDatasets
let cachedCaseLabels

let area = "Kaikki alueet"
let cumulative = true
let log = false

let useCasePercentage = true

let maxWeeks = 30
let limitTime = true

const dateRegex = /Vuosi (\d+) Viikko (\d+)/

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

// Add getweek to date
Date.prototype.getWeek = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};


function loadData(){
    fetch('/data/vaccines.json').then(function(res) {
        res.json().then(function(json) {
          cachedVaccine = json
          setAreas()
          updateVaccinations()
        })
    });
    fetch('/data/cases.json').then(function(res) {
        res.json().then(function(json) {
          cachedCases = json
          updateCases()
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
    _.forEach(cachedVaccine, val => {
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
        updateVaccinations()
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
        updateVaccinations() // cumulative needs also data update
        updateCases()
    }

    logBox.onclick = (e) => {
        log = e.target.checked
        updateVaccinationChart() // update only chart
        updateCaseChart()
    }
}

function updateVaccinations() {
    let data = cachedVaccine
    data = _.filter(data, (o)=>{
        return o.area === area
    })
    data = _.sortBy(data, 'dateweek20201226')
    data = _.groupBy(data, 'dateweek20201226')
    let times = []
    let datasets = []
    let colori = 0
    const curDate = new Date()
    const curWeek = curDate.getWeek()
    const curYear = curDate.getFullYear()
    _.forOwn(data, (arr, key)=>{
        if(key === 'Kaikki ajat') return
        const match = key.match(dateRegex)
        const year = Number(match[1])
        const week = Number(match[2])
        let weeksBehind = 0
        weeksBehind += (curYear - year) * 52 
        weeksBehind += (curWeek - week)
        if(weeksBehind <= 0) return
        if(limitTime && weeksBehind > maxWeeks) return
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
    cachedVaccineLabels = times
    cachedVaccineDatasets = datasets
    updateVaccinationChart(times, datasets)
}

function updateCases() {
    let data = cachedCases
    data = _.sortBy(data, 'dateweek20200101')
    data = _.groupBy(data, 'dateweek20200101')
    let times = []
    let datasets = []
    let colori = 0
    const curDate = new Date()
    const curWeek = curDate.getWeek()
    const curYear = curDate.getFullYear()
    _.forOwn(data, (arr, key)=>{
        if(key === 'Kaikki ajat') return
        const match = key.match(dateRegex)
        const year = Number(match[1])
        const week = Number(match[2])
        let weeksBehind = 0
        // TODO: take 53 week years into account
        weeksBehind += (curYear - year) * 52 
        weeksBehind += (curWeek - week)
        if(weeksBehind <= 0) return
        if(limitTime && weeksBehind > maxWeeks) return
        times.push(key)

        let total = 0
        if (useCasePercentage && !cumulative) {
            if (!arr.some((row)=>{
                if(row.ttr10yage === 'Kaikki ikäryhmät'){
                    total = Number(row.value)
                    return true
                }
            })){
                console.error("Didn't find total of age group... ")
            }
        }

        arr.forEach(row => {
            const age = row.ttr10yage
            let value = Number(row.value)
            if (useCasePercentage && !cumulative){
                if(age === 'Kaikki ikäryhmät') return
                value = value * 100 / total
            }
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
    cachedCaseLabels = times
    cachedCaseDatasets = datasets
    updateCaseChart(times, datasets)
}

function addPercentageSign(value) {
    return value + "%"
}

function updateCaseChart(labels = cachedCaseLabels, datasets = cachedCaseDatasets){
    const actuallyUsePercentage = useCasePercentage && !cumulative
    if(caseChart){
        caseChart.data.labels = labels
        caseChart.data.datasets = datasets
        caseChart.options.scales.yAxes[0].type = log ? 'logarithmic' : 'linear'
        caseChart.options.scales.yAxes[0].ticks.callback = actuallyUsePercentage ? addPercentageSign : function (v){return v}
        caseChart.update()
    }else{
        var ctx = document.getElementById('caseChart').getContext('2d');
        caseChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets,
                labels: labels
            },
            options: {
                maintainAspectRatio: false,
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
                        type: log ? 'logarithmic' : 'linear',
                        ticks: {
                            callback: actuallyUsePercentage ? addPercentageSign : function (v){return v}
                        }
                    }]
                }
                
            }
        });
    }
}

function updateVaccinationChart(labels = cachedVaccineLabels, datasets = cachedVaccineDatasets){
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
                maintainAspectRatio: false,
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
