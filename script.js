const searchBar = document.getElementById('landingSearchBar');
const searchResultsContainer = document.getElementById(
  'landingSearchResultsContainer'
);
const year = '2020';
const semester = 'fa';
let subjectData;
let selectedSubjects = [];
let selectedSubjectData = [];

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

function changeScreen() {
  document.getElementById('dataContainer').style.opacity = 1;
  document.getElementById('dataContainer').style.pointerEvents = 'auto';
  document.getElementById(
    'departmentContainer'
  ).innerHTML = selectedSubjects
    .map((department) => `<div class="dataDepartment">${department.name}</div>`)
    .join('');
  selectedToSelectedData();
}

function selectedToSelectedData() {
  selectedSubjectData = [];
  selectedSubjects.forEach(async (subject) => {
    let data = await fetch(
      `https://schedge.a1liu.com/${year}/${semester}/${
        subject.code.split('-')[1]
      }/${subject.code.split('-')[0]}`
    ).then((res) => res.json());
    selectedSubjectData.push(data);
  });
  console.log(selectedSubjectData);
}
