const url = "https://sampo.thl.fi/pivot/prod/fi/vaccreg/cov19cov/fact_cov19cov.json?filter=measure-533175&column=dateweek20201226-525425&row=cov_vac_age-518413&row=area-518362"
const JSONstat = require('jsonstat-toolkit')
const _ = require('lodash')
const fs = require('fs')

module.exports = function run(){
    JSONstat(url).then(J=>{
        const tbl = J.Dataset( 0 ).toTable({ type: 'arrobj' })
        fs.writeFileSync('./out/vaccines.json', JSON.stringify(tbl))
    })
}
