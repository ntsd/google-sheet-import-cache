// https://developers.google.com/apps-script/reference/cache

const CACHE_EXPIRATION = 21600; // The cache maximum is 21600 seconds (6 hours)
const CACHE_MAX_SIZE = 100000; // The Apps Scipt cache service have size limit so we do partial cache key

var cacheService = CacheService.getDocumentCache();

function getPartialCache(key) {
  let i = 0;
  let results = "";
  while (true) {
    const cached = cacheService.get(key + i);
    if (!cached) break;
    // console.log('Found cache', key + i);
    results += cached;
    i++;
  }
  return results;
}

function putPartialCache(key, value, expiration) {
  let i = 0;

  const valueLen = value.length;

  while (true) {
    const firstIdx = i * CACHE_MAX_SIZE;
    const lastIdx = (i + 1) * CACHE_MAX_SIZE;
    const partialValue = value.slice(firstIdx, lastIdx);
    // console.log('Put cache', key + i);
    cacheService.put(key + i, partialValue, expiration);
    if (lastIdx >= valueLen) break;
    i++;
  }
}

function fetchCache(url) {
  if (cacheService) {
    var cached = getPartialCache(url);
    if (cached) {
      console.log('Found cache', url);
      return cached;
    }
  }

  console.log('Not found cache', url);

  var response = UrlFetchApp.fetch(url);
  if (!response) return null;

  const contentText = response.getContentText();
  if (!contentText) return null;

  if (cacheService) putPartialCache(url, contentText, CACHE_EXPIRATION);
 
  return contentText;
}

function IMPORTXMLCACHE(url, query) {
  var contentText = fetchCache(url);
  if (!contentText) return "N/A";

  // console.log("Cache size", contentText.length);

  const $ = Cheerio.load(contentText);

  const result = $(query).contents().first().text();

  if (!result) return "N/A";

  return result;
}

function IMPORTXMLCACHE_TEST() {
  const url = 'https://html.spec.whatwg.org';
  const query = '#ipr';
  const result = IMPORTXMLCACHE(url, query);
  console.log(result);
}

function IMPORTDATACACHE(url, delimiter) {
  var contentText = fetchCache(url);
  if (!contentText) return "N/A";

  if (!delimiter) delimiter = ',';

  return Utilities.parseCsv(contentText, delimiter);
}

function IMPORTDATACACHE_TEST() {
  const url = 'https://people.sc.fsu.edu/~jburkardt/data/csv/addresses.csv';
  IMPORTDATACACHE(url);
}
