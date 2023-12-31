'use client'


import Plot from "react-plotly.js";


import { useEffect, useState } from "react";





export default function Home() {
  const [dataa, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    //fetch results
    fetch(`https://ckan.indiadataportal.com/api/3/action/datastore_search?limit=100000&resource_id=c0f168be-3532-4d08-b908-473ded89bd8b`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);
  //get records from the fetched result
  const records = dataa != null ? dataa['result']['records'] : null;

  const mapper = records != null ? (records as any).map((item: {
    holding_area: any;
    district_name: any; state_name: any, social_group: any, holding_num: any;
  }) => [item.state_name, item.social_group, item.holding_num, item.holding_area, item.district_name]) : null;

  const validStateNames = ["Uttar Pradesh", "Madhya Pradesh", "Punjab", 'Andhra Pradesh', "Telangana"];
  //filter them for the required states
  const mappedData = mapper != null ? mapper.filter((item: [state_name: string]) => validStateNames.includes(item[0])) : null;

  const groupedDataArray: {
    holding_area: any;
    district_name: any; stateName: any; social_group: any[]; holding_num: any[];
  }[] = [];
  const mappedallstates: { stateName: any; social_group: any[]; holding_num: any[]; holding_area: any[]; district_name: any[]; }[] = [];
  if (mapper != null) {
    //store the data for chloropeth map
    mapper.forEach(([stateName, socialGroup, holdingNum, holdingArea, districtName]: any) => {
      // Checked if an entry for the state already existed in groupedDataArray
      const existingEntry = mappedallstates.find(entry => entry.stateName === stateName);

      if (existingEntry) {
        // If the state entry exists, added the new data to it
        existingEntry.social_group.push(socialGroup);
        existingEntry.holding_num.push(holdingNum);
        existingEntry.holding_area.push(holdingArea);
        existingEntry.district_name.push(districtName);
      } else {
        // If the state entry doesn't exist, created a new entry
        mappedallstates.push({
          stateName,
          social_group: [socialGroup],
          holding_num: [holdingNum],
          holding_area: [holdingArea],
          district_name: [districtName]
        });
      }
    });
  }
  if (mappedData != null) {
    //store the data for grouped bar graph
    mappedData.forEach(([stateName, socialGroup, holdingNum, holdingArea, districtName]: any) => {
      // Checked if an entry for the state already existed in groupedDataArray
      const existingEntry = groupedDataArray.find(entry => entry.stateName === stateName);

      if (existingEntry) {
        // If the state entry exists, added the new data to it
        existingEntry.social_group.push(socialGroup);
        existingEntry.holding_num.push(holdingNum);
        existingEntry.holding_area.push(holdingArea);
        existingEntry.district_name.push(districtName);
      } else {
        // If the state entry doesn't exist, created a new entry
        groupedDataArray.push({
          stateName,
          social_group: [socialGroup],
          holding_num: [holdingNum],
          holding_area: [holdingArea],
          district_name: [districtName]
        });
      }
    });
  }
  const d: any[] = [];
  if (groupedDataArray != null) {
    //storing the data for the grouped bar graph
    groupedDataArray.forEach((item) => {
      const trace: any = {
        x: item.social_group,
        y: item.holding_num,
        name: item.stateName,
        type: 'bar'
      };
      d.push(trace);
    })
  }
  const [geojsonData, setGeojsonData] = useState(null);
  //fetched data from local geojson file
  useEffect(() => {

    fetch('india_states.geojson')
      .then((response) => response.json())
      .then((data) => setGeojsonData(data))
      .catch((error) => console.error('Error loading GeoJSON data: ', error));
  }, []);

  var cd: any = [];
  //stored the data for chloropeth graph
  if (mappedallstates != null) {
    var l: string[] = [];
    var z: number[] = [];

    mappedallstates.forEach((item) => {

      item.district_name.forEach((element: any) => {
        l.push(element)
      });
      item.holding_area.forEach((element: any) => {
        z.push(element)
      })

    })
    cd = [{
      type: 'choropleth',
      locations: l, // District names
      z: z, // Holding areas

      geojson: geojsonData,

      colorscale: 'Viridis',
      colorbar: { title: 'Holding Area' },
    }
    ];

  }
  console.log(cd)

  return dataa == null ?
    <main>
      "loading data"
    </main> : (
      <main>
        <h1>Hello</h1>
        <Plot
          data={d}
          layout={{ barmode: 'group', xaxis: { title: 'Social Group' }, yaxis: { title: 'Holding num' }, title: 'Grouped Bar Chart for 5 States' }}
        />
        <Plot
          data={cd}
          layout={{ title: 'Chloropeth Map', geo: { projection: { type: 'robinson' } } }}
        />
      </main>
    );
}
