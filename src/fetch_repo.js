function fetchRepos() {
  const github_access_token = PropertiesService.getScriptProperties().getProperty("GITHUB_ACCESS_TOKEN");
  const github_gql_endpoint = PropertiesService.getScriptProperties().getProperty("GITHUB_GQL_ENDPOINT");
  const sheet_id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const sheet_name = PropertiesService.getScriptProperties().getProperty("REPO_SHEET_NAME");
  const sheet = SpreadsheetApp.openById(sheet_id).getSheetByName(sheet_name);
  let hasNextPage = true;
  let cursor = "";
  let row = 2;

  // ヘッダー
  const keys = Object.keys(fetchReposByGQL(cursor, github_access_token, github_gql_endpoint)["data"]["organization"]["repositories"].nodes[0]);
  sheet.getRange(1, 1, 1, keys.length).setValues([keys]).setBackground('lightblue');

  do {
    const res = fetchReposByGQL(cursor, github_access_token, github_gql_endpoint);
    // Logger.log(res);
    const nodes = res["data"]["organization"]["repositories"].nodes;
    let arr = [];
    // arr.push(Object.keys(nodes[0]));
    for(i=0; i<nodes.length; i++){
      arr.push(Object.values(nodes[i]));
    }
    // setValues
    sheet.getRange(row, 1, arr.length, arr[0].length).setValues(arr);

    row += nodes.length;
    hasNextPage = res["data"]["organization"]["repositories"].pageInfo.hasNextPage;
    cursor = res["data"]["organization"]["repositories"].pageInfo.endCursor;
  } while (hasNextPage != false);

  Logger.log("done");
}

function fetchReposByGQL(cursor, github_access_token, github_gql_endpoint) {
  let cursorArg = "";
  // Logger.log(cursor);
  if(cursor != "") {
    cursorArg = `, after: "${cursor}"`;
  };
  const query = `{
    organization(login: "giftee") {
      repositories(first: 30${cursorArg}) {
        pageInfo {
          endCursor
          hasNextPage
        }
        totalCount
        nodes {
          name
          description
          createdAt
          updatedAt
          url
          isArchived
          primaryLanguage {
            name
          }
          languages(first: 5) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }
  }`;
  const options = {
    'method' : 'get',
    'contentType' : 'application/json',
    'headers' : {
      'Authorization' : 'Bearer ' +  github_access_token
     },
    'payload' : JSON.stringify({query:query})
  };
  const response = UrlFetchApp.fetch(github_gql_endpoint, options);
  const json = JSON.parse(response.getContentText());

  return JSON.parse(JSON.stringify(json));
}