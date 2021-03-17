// const url = "https://sampo.thl.fi/pivot/prod/fi/vaccreg/cov19cov/fact_cov19cov.json?filter=measure-533175&column=dateweek20201226-525425&row=cov_vac_age-518413&row=area-518362"
JSONstat("./cached-response.json").then(J=> {
    console.log(J.Dataset( 0 ).toTable({ type: 'arrobj' }))
})