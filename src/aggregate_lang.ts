function aggregatePrimaryLanguage() {
  const repoCount = 360;
  const sheet_id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const repo_sheet_name = PropertiesService.getScriptProperties().getProperty("REPO_SHEET_NAME");
  const origin_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName(repo_sheet_name);
  const range = origin_sheet.getRange(2, 7, repoCount + 1, 1);
  const vals = range.getValues();
  const lang_sheet_name = PropertiesService.getScriptProperties().getProperty("LANG_SHEET_NAME");

  let obj = {};

  for(let i=0; i<vals.length; i++){
    let val = vals[i][0];
    if (val == "") {
      continue;
    }
    val = val.replace("{name=", "").replace("}", "");
    obj[val] = obj[val] ? obj[val] + 1 : 1;
  }

  obj = sortObj(obj);
  let arr = Object.keys(obj).map((k)=>([k, obj[k] ]));
  const s = SpreadsheetApp.openById(sheet_id)
  s.getSheetByName(lang_sheet_name).getRange(1, 1, arr.length, arr[0].length).setValues(arr);
}

function round(origin, digit) {
  const seed = 10**digit
  return Math.round(origin * seed) / seed;
}

function sortObj(obj) {
  let array = Object.keys(obj).map((k)=>({ key: k, value: obj[k] }));
  array.sort((a, b) => b.value - a.value);
  obj = Object.assign({}, ...array.map((item) => ({
      [item.key]: item.value,
  })));
  return obj
}
