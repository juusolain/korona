let data
let vaccinationChart

function loadData(){
    fetch('/data/vaccines.json').then(function(res) {
        res.json().then(function(json) {
          data = json
          updateChart()
        });
      });
}


function updateChart(){
    if(vaccinationChart){

    }else{
        var ctx = document.getElementById('vaccinationChart').getContext('2d');
        var vaccinationChart = new Chart(ctx, {
            type: 'line',
            data: data
        });
    }

}

loadData()