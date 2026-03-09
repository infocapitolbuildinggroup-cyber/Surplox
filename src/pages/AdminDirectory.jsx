import React, { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"

export default function AdminDirectory() {

  const [workers,setWorkers] = useState([])
  const [tradeFilter,setTradeFilter] = useState("")
  const [minCrew,setMinCrew] = useState(1)
  const [zip,setZip] = useState("")
  const [radius,setRadius] = useState(50)
  const [search,setSearch] = useState("")
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    loadWorkers()

  },[])


  async function loadWorkers(){

    setLoading(true)

    const { data,error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at",{ ascending:false })

    if(!error && data){
      setWorkers(data)
    }

    setLoading(false)

  }


  const filtered = workers.filter(w=>{

    if(tradeFilter && w.trade !== tradeFilter) return false
    if(search && !w.display_name?.toLowerCase().includes(search.toLowerCase())) return false
    if(minCrew && w.crew_size < minCrew) return false

    return true

  })


  function exportCSV(){

    const headers = [
      "Name",
      "Role",
      "Trade",
      "City",
      "Zip",
      "Crew Size",
      "Travel Radius",
      "Phone",
      "Email"
    ]

    const rows = filtered.map(w=>[
      w.display_name,
      w.role,
      w.trade,
      w.city,
      w.home_zip,
      w.crew_size,
      w.travel_radius,
      w.phone,
      w.email
    ])

    const csv = [
      headers.join(","),
      ...rows.map(r=>r.join(","))
    ].join("\n")

    const blob = new Blob([csv])
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "surplox_workers.csv"
    a.click()

  }


  return (

    <div className="stack-lg">

      <div className="card">

        <div className="h2">
          Crew Match Dashboard
        </div>

        <div className="muted">
          Search, filter, and organize your Surplox network by job location, trade, and crew size.
        </div>

        <hr/>

        <div className="grid two">

          <div>

            <div className="stack-sm">

              <div className="muted">Trade</div>

              <select
                className="input"
                value={tradeFilter}
                onChange={e=>setTradeFilter(e.target.value)}
              >
                <option value="">All Trades</option>
                <option>Concrete & Flatwork</option>
                <option>Drywall</option>
                <option>Electrical</option>
                <option>Framing / Carpentry</option>
                <option>HVAC</option>
                <option>Masonry</option>
                <option>Painting</option>
                <option>Plumbing</option>
                <option>Roofing</option>
                <option>Welding & Fabrication</option>
              </select>

            </div>

          </div>


          <div>

            <div className="stack-sm">

              <div className="muted">Minimum Crew Size</div>

              <input
                className="input"
                type="number"
                value={minCrew}
                onChange={e=>setMinCrew(Number(e.target.value))}
              />

            </div>

          </div>


          <div>

            <div className="stack-sm">

              <div className="muted">Job ZIP</div>

              <input
                className="input"
                value={zip}
                onChange={e=>setZip(e.target.value)}
                placeholder="Enter ZIP"
              />

            </div>

          </div>


          <div>

            <div className="stack-sm">

              <div className="muted">Search Workers</div>

              <input
                className="input"
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Name or trade"
              />

            </div>

          </div>

        </div>


        <div style={{marginTop:20}} className="row">

          <button
            className="btn primary"
            onClick={exportCSV}
          >
            Export CSV
          </button>

          <div className="badge">
            {filtered.length} results
          </div>

        </div>

      </div>


      {loading && (
        <div className="card">
          Loading workers...
        </div>
      )}


      {!loading && filtered.map(worker=>(

        <div
          key={worker.user_id}
          className="card"
        >

          <div className="row">

            <div>

              <div className="postTitle">
                {worker.display_name}
              </div>

              <div className="postMeta">

                <span className="badge">
                  {worker.role}
                </span>

                {worker.trade && (
                  <span className="badge good">
                    {worker.trade}
                  </span>
                )}

              </div>

            </div>

          </div>


          <div className="grid two" style={{marginTop:14}}>

            <div className="card-soft card">

              <div className="muted">Location</div>

              <div>
                {worker.city} • ZIP {worker.home_zip}
              </div>

            </div>


            <div className="card-soft card">

              <div className="muted">Crew / Radius</div>

              <div>
                Crew Size: {worker.crew_size} • Radius: {worker.travel_radius} miles
              </div>

            </div>


            <div className="card-soft card">

              <div className="muted">Contact</div>

              <div>
                Phone: {worker.phone}
              </div>

              <div>
                Email: {worker.email}
              </div>

            </div>


            <div className="card-soft card">

              <div className="muted">Private Notes</div>

              <textarea
                className="input"
                placeholder="Private notes for reliability, pricing, follow-up, or job history."
              />

            </div>

          </div>

        </div>

      ))}

    </div>

  )

}