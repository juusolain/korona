let vaccinationChart
let cachedData

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
    '#8c63d6'
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
}

function updateData(area="Kaikki alueet", cumulative=true) {
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
    updateChart(times, datasets)
}


function updateChart(labels, datasets){
    if(vaccinationChart){

    }else{
        var ctx = document.getElementById('vaccinationChart').getContext('2d');
        var vaccinationChart = new Chart(ctx, {
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
                    
                }
                
            }
        });
    }

}

loadData()