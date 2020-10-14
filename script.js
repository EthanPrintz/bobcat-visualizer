const searchBar = document.getElementById('landingSearchBar');
const searchResultsContainer = document.getElementById(
  'landingSearchResultsContainer'
);
const year = '2020';
const semester = 'fa';
let subjectData;
let selectedSubjects = [];
let selectedSubjectData = [];
const colors = ['#ffb000', '#ff6000', '#db2680', '#795df0', '#6390ff'];
(async function initScript() {
  subjectData = await querySubjectData();
  searchBar.addEventListener('input', displaySearchResults);
  document
    .getElementById('landingContinueButton')
    .addEventListener('click', changeScreen);
})();

async function querySubjectData() {
  return await fetch('https://schedge.a1liu.com/subjects').then((response) =>
    response.json()
  );
}

function displaySearchResults() {
  if (searchBar.innerHTML.length > 0) {
    let searchResults = searchSubjects(searchBar.innerHTML.toLowerCase());
    if (searchResults.length > 0) {
      searchResultsContainer.innerHTML = searchResults
        .reduce(
          (acc, dept) =>
            acc +
            `<div class="landingSearchResult"><div class="resultCode">${dept['code']}</div>
      <div class="resultTitle">${dept['name']}</div></div>`
        )
        .replace('[object Object]', '');
      addDepartmentListeners();
    } else {
      searchResultsContainer.innerHTML = `<span id="noResults">No Results</span>`;
    }
  } else {
    searchResultsContainer.innerHTML = '';
  }
}

function searchSubjects(input) {
  let matchingArray = [];
  Object.keys(subjectData).forEach((school) => {
    Object.keys(subjectData[school]).forEach((department) => {
      let schoolCode = school;
      let departmentCode = department;
      let departmentName = subjectData[school][department].name;
      if (
        departmentCode.toLowerCase().search(input) != -1 ||
        departmentName.toLowerCase().search(input) != -1
      ) {
        matchingArray.push({
          name: departmentName,
          code: `${departmentCode.toUpperCase()}-${schoolCode}`,
        });
      }
    });
  });
  if (matchingArray.length > 5) {
    return matchingArray.slice(0, 6);
  } else {
    return matchingArray;
  }
}

function addDepartmentListeners() {
  let searchResults = document.querySelectorAll('.landingSearchResult');
  if (searchResults.length > 0) {
    searchResults.forEach((result) => {
      result.addEventListener('click', function () {
        // Add to selected subjects array
        selectedSubjects.push({
          code: this.querySelector('.resultCode').innerHTML,
          name: this.querySelector('.resultTitle').innerHTML,
        });
        // Clear search results
        document.getElementById('landingSearchResultsContainer').innerHTML = '';
        // Map selected subjects to dom elements and insert
        document.getElementById(
          'landingDepartmentContainer'
        ).innerHTML = selectedSubjects
          .map(
            (department) =>
              `<div class="landingDepartment">${department.name}</div>`
          )
          .join('');
        // Add event listeners to selected departments
        document
          .querySelectorAll('.landingDepartment')
          .forEach((department) => {
            department.addEventListener('click', function () {
              let departmentIndex = selectedSubjects.findIndex(
                (dept) => dept.name == this.innerHTML
              );
              selectedSubjects.splice(departmentIndex, 1);
              this.remove();
              checkSelectedSubjects();
            });
          });
        checkSelectedSubjects();
      });
    });
  }
}

function checkSelectedSubjects() {
  if (selectedSubjects.length >= 2) {
    document.getElementById('landingContinueButton').style.display = 'block';
  } else {
    document.getElementById('landingContinueButton').style.display = 'none';
  }
  if (selectedSubjects.length >= 5) {
    document
      .getElementById('landingSearchBar')
      .setAttribute('contenteditable', 'false');

    document
      .getElementById('landingSearchBar')
      .classList.add('searchBarDisabled');
  } else {
    document
      .getElementById('landingSearchBar')
      .setAttribute('contenteditable', 'true');

    document
      .getElementById('landingSearchBar')
      .classList.remove('searchBarDisabled');
  }
}

async function changeScreen() {
  document.getElementById('dataContainer').style.opacity = 1;
  document.getElementById('dataContainer').style.pointerEvents = 'auto';
  document.getElementById(
    'departmentContainer'
  ).innerHTML = selectedSubjects
    .map((department) => `<div class="dataDepartment">${department.name}</div>`)
    .join('');
  let selectedSections = await selectedToSelectedData();
  setupStartTimeWindow(selectedSections);
  setupTypeWindow(selectedSections);
  setupDurationWindow(selectedSections);
  setupLanguageWindow(selectedSections);
  document
    .querySelectorAll('.dataWindow')
    .forEach((window) => window.addEventListener('click', changeWindow));
}

async function selectedToSelectedData() {
  selectedSubjectData = [];
  for (let i = 0; i < selectedSubjects.length; i++) {
    let subject = selectedSubjects[i];
    let data = await fetch(
      `https://schedge.a1liu.com/${year}/${semester}/${
        subject.code.split('-')[1]
      }/${subject.code.split('-')[0]}`
    ).then((res) => res.json());
    selectedSubjectData.push(data);
  }
  return selectedSubjectData;
}

function changeWindow() {
  let currentlyOpen = document.querySelector('.dataWindowOpen');
  currentlyOpen.classList.remove('dataWindowOpen');
  currentlyOpen.classList.add('dataWindowClosed');
  this.classList.add('dataWindowOpen');
  this.classList.remove('dataWindowClosed');

  let startWindow = document.getElementById('startWindow');
  let durationWindow = document.getElementById('durationWindow');
  let typeWindow = document.getElementById('typeWindow');
  let languageWindow = document.getElementById('languageWindow');
  document.querySelectorAll('.dataWindow').forEach((window) => {
    window.classList.remove('windowLeft', 'windowRight', 'one', 'two', 'three');
  });
  if (this.id == 'startWindow') {
    durationWindow.classList.add('windowRight', 'one');
    typeWindow.classList.add('windowRight', 'two');
    languageWindow.classList.add('windowRight', 'three');
  }
  if (this.id == 'durationWindow') {
    startWindow.classList.add('windowLeft', 'one');
    typeWindow.classList.add('windowRight', 'one');
    languageWindow.classList.add('windowRight', 'two');
  }
  if (this.id == 'typeWindow') {
    startWindow.classList.add('windowLeft', 'two');
    durationWindow.classList.add('windowLeft', 'one');
    languageWindow.classList.add('windowRight', 'one');
  }
  if (this.id == 'languageWindow') {
    startWindow.classList.add('windowLeft', 'three');
    durationWindow.classList.add('windowLeft', 'two');
    typeWindow.classList.add('windowLeft', 'one');
  }
}

function setupStartTimeWindow(selectedSections) {}

function setupTypeWindow(selectedSections) {
  selectedSections.forEach((department, i) => {
    let rawTypes = [];
    let finalTypes = [];
    department.forEach((course) => {
      course.sections.forEach((section) => {
        rawTypes.push(section.type);
      });
    });
    rawTypes.forEach((type) => {
      if (!finalTypes.some((finalType) => finalType.name == type)) {
        finalTypes.push({
          name: type,
          value: 1,
          total: rawTypes.length,
        });
      } else {
        finalTypes.find((finalType) => finalType.name == type).value++;
      }
    });

    var width = 252;
    var height = 252;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 40; //This is the size of the hole in the middle

    var color = d3
      .scaleOrdinal()
      .domain(finalTypes.map((type) => type.name))
      .range([
        colors[i],
        chroma(colors[i]).darken(0.5).hex(),
        chroma(colors[i]).darken(1).hex(),
        chroma(colors[i]).darken(1.5).hex(),
        chroma(colors[i]).darken(2).hex(),
        chroma(colors[i]).darken(2.5).hex(),
        chroma(colors[i]).darken(3).hex(),
      ]);

    var svg = d3
      .select('#typeWrapper')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    var arc = d3
      .arc()
      .innerRadius(radius - donutWidth)
      .outerRadius(radius);
    var pie = d3
      .pie()
      .value(function (d) {
        return d.value;
      })
      .sort(null);
    var path = svg
      .selectAll('path')
      .data(pie(finalTypes))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function (d, i) {
        return color(d.data.name);
      })
      .attr('transform', 'translate(0, 0)');

    var legendRectSize = 13;
    var legendSpacing = 7;
    var legend = svg
      .selectAll('.legend') //the legend and placement
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'circle-legend')
      .attr('transform', function (d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = (height * color.domain().length) / 2;
        var horz = -2 * legendRectSize - 13;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });
    legend
      .append('circle') //keys
      .style('fill', color)
      .style('stroke', color)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', '.5rem');
    legend
      .append('text') //labels
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) {
        return d.toUpperCase().split(' ')[0];
      });
  });
}

function setupDurationWindow(selectedSections) {
  let durationData = [];
  let sections = [];
  selectedSections.forEach((department) => {
    if (department.length > 0) {
      sections.push(department[0].subjectCode.code);
    }
    department.forEach((course) => {
      if (course.sections) {
        course.sections.forEach((section) => {
          if (section.meetings) {
            section.meetings.forEach((meeting) => {
              durationData.push({
                type: course.subjectCode.code,
                value: meeting.minutesDuration,
              });
            });
          }
        });
      }
    });
  });

  // Original sourced from https://www.d3-graph-gallery.com/graph/histogram_double.html
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  let svg = d3
    .select('#durationWrapper')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // get the data
  // X axis: scale and draw:
  let x = d3
    .scaleLinear()
    .domain([0, 300]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    .range([0, width]);
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  // set the parameters for the histogram
  let histogram = d3
    .histogram()
    .value((d) => {
      return +d.value;
    }) // I need to give the vector of value
    .domain(x.domain()) // then the domain of the graphic
    .thresholds(x.ticks(40)); // then the numbers of bins

  let bins = [];
  sections.forEach((section) => {
    bins.push(
      histogram(
        durationData.filter((d) => {
          return d.type === section;
        })
      )
    );
  });

  // Y axis: scale and draw:
  let y = d3.scaleLinear().range([height, 0]);
  y.domain([0, 20]); // d3.hist has to be called before the Y axis obviously
  svg.append('g').call(d3.axisLeft(y));

  // append the bars for series 1
  sections.forEach((section, i) => {
    svg
      .selectAll(`rect${i}`)
      .data(bins[i])
      .enter()
      .append('rect')
      .attr('x', 1)
      .attr('transform', (d) => {
        return 'translate(' + x(d.x0) + ',' + y(d.length) + ')';
      })
      .attr('width', (d) => {
        return Math.abs(x(d.x1) - x(d.x0) - 1);
      })
      .attr('height', (d) => {
        return Math.abs(height - y(d.length));
      })
      .style('fill', colors[i])
      .style('opacity', 0.6);
  });
}

function setupLanguageWindow(selectedSections) {
  let usedContainer = document.getElementById('usedWordsContainer');
  usedContainer.innerHTML = '';

  let departmentStrings = [];
  selectedSections.forEach((department) => {
    if (department.length > 0) {
      let currentDepartment = {
        code: department[0].subjectCode.code,
        words: [],
      };
      department.forEach((course) => {
        currentDepartment.words.push(
          course.name
            .replace(/[^\w\s]/gi, '')
            .toLowerCase()
            .split(' ')
        );
      });
      departmentStrings.push(currentDepartment);
    }
  });

  let disallowed = [
    'for',
    'of',
    'in',
    'to',
    'with',
    'and',
    'a',
    '1',
    '2',
    'for',
    '',
    ' ',
    'i',
    '21st',
    'is',
    'info',
    'big',
    'topics',
    'pac',
    'phd',
    'honors',
    'his',
    'into',
    'the',
    'lit',
    'cs',
    'from',
    'intro',
    'i',
    'ii',
    'iii',
    'iv',
    'v',
    'vi',
    'vii',
  ];

  departmentStrings.forEach((department) => {
    let newDepartmentDiv = document.createElement('div');
    shuffleArray(department.words).forEach((array) => {
      shuffleArray(array).forEach((word) => {
        if (!disallowed.includes(word)) {
          newDepartmentDiv.innerHTML += word + ' ';
        }
      });
    });
    usedContainer.appendChild(newDepartmentDiv);
  });
}

// From https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
