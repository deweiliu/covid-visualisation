
const dataPath = "./data/nextstrain_ncov_open_global_metadata.tsv"
const deathPath = './data/overview_2022-04-08.csv'

let leftIndex = 0
let rightIndex = 1
let newDataPieIndex= []
let lastDay = []
let newDate = []
let dataDict = []
let allcladeMembership
let allDate
let currentDateSelect

//import tsv file
d3.tsv(dataPath).then(function (data){
     allDate = (data.map(d => d.date))
     allcladeMembership = (data.map(d => d.clade_membership))

     newDate = convertToDate(allDate)

    //create dict
    for(var i=0;i<newDate.length;i++){
        dataDict.push({
            date:newDate[i],
            value:allcladeMembership[i]
        })
    }

    //unique member
    let uniqueClades = [...new Set(allcladeMembership)]

    let lastDayList = getLastDay()

    var indexOfDate = []

    for(var i =0;i<newDate.length;i++)
        for(var j=0;j<lastDayList.length;j++){
            if(newDate[i].getTime()==lastDayList[j].getTime()){
                lastDay.push(newDate[i])
                indexOfDate.push(i)
            }
        }

    //only the end of month
    var newDataPie = []
    for(var i=0;i<indexOfDate.length;i++)
        newDataPie.push({
            date:newDate[indexOfDate[i]],
            value:allcladeMembership[indexOfDate[i]],
            index:indexOfDate[i]
        })

    //remove same element
    //get correlated index

    newDataPieIndex[0] = 0
    for(var i=0;i<newDataPie.length-1;i++){
        if(newDataPie[i].date.toString() != newDataPie[i+1].date.toString())
            newDataPieIndex.push(newDataPie[i].index)
        else
            continue
    }

    selectRange()
})
    //count label number
    //choose range
function selectRange(leftIndex = 0,rightIndex = 1) {
    let uniqueClades_0 = [...new Set(allcladeMembership.slice(newDataPieIndex[leftIndex], newDataPieIndex[rightIndex]))]


    var uniqueClades_dict = new Array()
    //init dict
    for (var i = 0; i < uniqueClades_0.length; i++)
        uniqueClades_dict[uniqueClades_0[i]] = 0

    var cladesDictPie = []
    for (var i = newDataPieIndex[leftIndex]; i < newDataPieIndex[rightIndex]; i++) {
        uniqueClades_dict[allcladeMembership[i]]++
    }

    for (var key in uniqueClades_dict) {
        cladesDictPie.push({name: key, value: uniqueClades_dict[key]})
    }

    drawPieChart(cladesDictPie)

}


function drawPieChart(data){
    var width = 500,
        height = 500,
        padding = {
            top: 40,
            right: 40,
            bottom: 40,
            left: 40
        };

    var colors = d3.schemePaired;

    var svg = d3.select("#pie-svg")
        .append('svg')
        .attr("id","svg1")
        .attr('width', (width * 2) + 'px')
        .attr('height', (height * 2) + 'px');


    //pie chart
    var pie = d3.pie().value(function(d) {
        return d.value;
    })(data);

    var radius = Math.min(width, height);

   //arc generator
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius / 2);

    // larger arc for drawing
    var outArc = d3.arc()
        .innerRadius(radius / 2.5)
        .outerRadius(radius/1.2);

    //larger radius
    const arcLarger = d3.arc()
        .outerRadius(radius/2 * 1.1)
        .innerRadius(0)

    //normal radius
    const arcNormal = d3.arc()
        .outerRadius(radius/2)
        .innerRadius(0);

    var line = d3.line()
        .x(function(d) {
            return d[0];
        })
        .y(function(d) {
            return d[1];
        });

    // get notation line
    var getLabelLine = function(d, type) {
        var startPos = d.startAngle + (d.endAngle - d.startAngle) / 2;
        var data = [];
        var ra = (type === "text") ? 2.5 : 1;
        data.push(arc.centroid(d));
        data.push(outArc.centroid(d));
        data.push({
            0: outArc.centroid(d)[0] + (40 * (startPos < Math.PI ? 1 : -ra)),
            1: outArc.centroid(d)[1]
        });

        return data;
    }

    var containers = svg.append("g")
        .attr("transform", "translate(" + height + "," + height + ")");

    var container = containers.selectAll("g")
        .data(pie)
        .join("g");


    // draw pie chart
    container.append("path")
        .attr("stroke", "white")
        .attr("d", arc)
        .attr("fill", function (d, i) {
            return colors[i];
        });

    // mark line
    container.append("path")
        .datum(function (d) {
            return getLabelLine(d, "path");
        })
        .attr("class", "tips")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .style('visibility', 'hidden')


        // draw text on notation line
        container.append("text")
            .datum(function (d) {
                d.pos = getLabelLine(d, "text")[2];
                return d;
            })
            .text(function (d) {
                return (d.data.name);
            })
            .attr("dx", function (d) {
                return d.pos[0]
            })
            .attr("dy", function (d) {
                return d.pos[1]
            }).style('visibility', 'hidden')

        //second
        container.append("text")
            .datum(function (d) {
                d.pos = getLabelLine(d, "text")[2];
                return d;
            })
            .text(function (d) {
                return ("Num: " + d.data.value);
            })
            .attr("dx", function (d) {
                return d.pos[0] - 10
            })
            .attr("dy", function (d) {
                return d.pos[1] - 20
            }).style('visibility', 'hidden');

        currentDateSelect = dataDict[newDataPieIndex[rightIndex]].date

        //title
        svg.append('text')
            .classed('title', true)
            .attr('x', width)
            .attr('y', -20)
            .attr('dy', '2em')
            .text('Clade Membership Pie Chart:  '+showDateOnText(currentDateSelect.toString()))
            .attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .attr('stroke', 'black');

    let tooltip = d3.select('body').append('div');
    container.on('mouseover', function(event){
        const[x, y] = d3.pointer(event);
        d3.select(this).select('path').transition().attr('d', arcLarger)
        d3.select(this).selectAll('text').style('visibility', 'visible')
        d3.select(this).select('.tips').style('visibility', 'visible')
    }) .on('mouseleave', function(){
        d3.select(this).select('path').transition().attr('d', arcNormal)
        d3.select(this).selectAll('text').style('visibility', 'hidden')
        d3.select(this).selectAll('.tips').style('visibility', 'hidden')
    })

    //label
    let label=svg.selectAll('.label')
        .data(data)
        .enter()
        .append('g')
        .attr("transform","translate(" + (width / 2 + radius/2 *2.3) + "," +10 + ")");
    label.append('rect')
        .style('fill',function(d,i){
            return colors[i];
        })
        .attr('x', 0)
        .attr("y",function(d,i){
            return (height - radius/2) / 2 + (i - 1) * 30;
        })
        .attr('rx','10')
        .attr('ry','10')
        .attr('width',50)
        .attr('height',20);
    label.append('text')
        .attr('x',function(d,i){
            return 55;
        })
        .attr("y",function(d,i){
            return (height - radius/2) / 2 + 15 + (i - 1) * 30;
        })
        .text(function(d){
            return d.name;
        })
        .style({
            "font-size":"10px",
            "text-anchor":"middle",
            'fill':"white",
            "font-weight":600
        });

}

    //change i
    // when the input range changes update value
    d3.select("#nValue").on("input", function() {
        update(+this.value);
    });

    // adjust the text
    function update(nValue) {
        leftIndex = nValue-1
        rightIndex = nValue
        d3.selectAll("#svg1").remove()
        selectRange(leftIndex,rightIndex)
    }


//line chart
d3.csv(deathPath).then(function (data){
    let allDate = (data.map(d => d.date))
    let allDeathNum = (data.map(d => d.cumDeaths28DaysByDeathDate))

    //count all valid data
    var k =0

    for (let i = 0; i < allDeathNum.length; i++) {
        if (allDeathNum[i]!=="") {
            continue
        }
        else
        {
            k=i
            break
        }
    }
    //slice array
    allDeathNum = allDeathNum.slice(0,k)
    allDate = allDate.slice(0,k)

    var newDate = convertToDate(allDate)

    let lastDayList = getLastDay()
    var lastDay = []
    var indexDeathPerMonth = []
    var deathPerMonth = []


    for(var i =0;i<newDate.length;i++)
        for(var j=0;j<lastDayList.length;j++){
            if(newDate[i].getTime()==lastDayList[j].getTime()){
                lastDay.push(newDate[i])
                indexDeathPerMonth.push(i)
                deathPerMonth.push(allDeathNum[i])
            }
        }

    //sort to ascending order
    deathPerMonth.reverse()
    lastDay.reverse()

    var deathPerMonthUpdate = []
    //update death per month
    deathPerMonthUpdate.push(deathPerMonth[0])
    for(var i=0;i<deathPerMonth.length-1;i++) {
        var curNum = deathPerMonth[i]
        var nextNum = deathPerMonth[i+1]
        deathPerMonthUpdate.push(nextNum-curNum)
    }
    var resdict = []
    for(var i=0;i<lastDay.length;i++){
        resdict.push({
            date:lastDay[i],
            value:deathPerMonthUpdate[i]
        })
    }

    var min = d3.min(resdict, function(d) {
        return d.value;
    })
    var max = d3.max(resdict, function(d) {
        return d.value;
    })

    // height and width
    var width = 1000,
        height = 500,
        padding = {
            top: 10,
            right: 40,
            bottom: 40,
            left: 40
        };
    //xscale
    var xScale = d3.scaleTime()
        .domain(d3.extent(resdict, function(d) {
            return d.date;
        }))
        .range([padding.left, width - padding.right]);
    //yscale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(resdict, function(d) {
            return d.value;
        })])
        .range([height - padding.bottom, padding.top]);
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

    var svg = d3.select("#line-svg")
        .append('svg')
        .attr('width', width + 'px')
        .attr('height', height + 'px');
    var xAxis = d3.axisBottom()
        .scale(xScale);
    var yAxis = d3.axisLeft()
        .scale(yScale);

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
        .call(xAxis);
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .call(yAxis);

    svg.append('text')
        .classed('title', true)
        .attr('x', width*0.85)
        .attr('y', 10)
        .attr('dy', '2em')
        .text('Monthly Death Toll in the UK')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('stroke', 'black');
    //ling plot
    var linePath = d3.line()
        .x(function(d){ return xScale(d[0]) })
        .y(function(d){ return yScale(d[1]) });

    var line = d3.line()
        .x(function(d) {
            return xScale(d.date);
        })
        .y(function(d) {
            return yScale(d.value);
        });

    // path
    svg.append("path")
        .datum(resdict)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    for(var i=0;i<deathPerMonthUpdate.length;i++)
        deathPerMonthUpdate[i] = deathPerMonthUpdate[i].toString()

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("");

    //death info
    svg.append("text")
        .attr("x",800)
        .attr("y", 100)
        .attr("dy", ".35em")
        .attr("stroke","black")
        .text("Death Toll: ");


    let circle = resdict.forEach((d,i) => {
        var value = d.value
        svg.append("circle")
            .data(resdict)
            .attr("id", "circleTooltip")
            .attr("cx", xScale(d.date))
            .attr("cy", yScale(d.value))
            .attr("r", 5)
            .on("mouseover", function(d,i,n){
                d3.select(this)
                .attr("fill","red")
                //death value
                svg.append("text")
                    .attr("x",900)
                    .attr("y", 100)
                    .attr("id","numText")
                    .attr("dy", ".35em")
                    .attr("stroke","black")
                    .text(value)
            })
            .on("mouseout", function(){
                    d3.select(this)
                        .attr("fill","black")
                    d3.select('#numText').remove()
                return tooltip.style("visibility", "hidden")
                })
    })

})

function convertToDate(dateArray){
    //  Convert a "dd/MM/yyyy" string into a Date object
    var newArry = []
    for(var i=0;i<dateArray.length;i++){
        let d = dateArray[i].split("/")
        let dat = new Date(d[2] + '/' + d[1] + '/' + d[0])
        newArry.push(dat)
    }
    return newArry
}

function getLastDay(){
    var year = 2020
    var month = 0
    var lastDayArr = []
    for(var i =0;i<=2;i++)
        for(var j =1;j<=12;j++){
            var d = new Date(2020+i, month + j, 0)
            lastDayArr.push(d)
        }

    return lastDayArr
}

//select date according to month selected
function showDateOnText(date){
    var month = ['Jan','Feb',"Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    var year = ['2020','2021','2022']
    var month_select
    var year_select
    for(var i =0;i<month.length;i++)
        if(date.search(month[i])!=-1)
            month_select = month[i]
    for(var i =0;i<year.length;i++)
        if(date.search(year[i])!=-1)
            year_select = year[i]

    return month_select+" "+year_select
}


