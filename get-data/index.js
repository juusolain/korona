const url_vaccines = "https://sampo.thl.fi/pivot/prod/fi/vaccreg/cov19cov/fact_cov19cov.json?filter=measure-533175&column=dateweek20201226-525425&row=cov_vac_age-518413&row=area-518362"
const url_cases_all = "https://sampo.thl.fi/pivot/prod/fi/epirapo/covid19case/fact_epirapo_covid19case.json?filter=measure-444833&row=ttr10yage-444309&column=dateweek20200101-509030"

const JSONstat = require('jsonstat-toolkit')
const _ = require('lodash')
const fs = require('fs')

JSONstat(url_vaccines).then(J=>{
        const tbl = J.Dataset( 0 ).toTable({ type: 'arrobj' })
        fs.writeFileSync('./out/vaccines.json', JSON.stringify(tbl))
})

JSONstat(url_cases_all).then(J=>{
    console.log(J)
    const tbl = J.Dataset( 0 ).toTable({ type: 'arrobj' })
    fs.writeFileSync('./out/cases.json', JSON.stringify(tbl))
})