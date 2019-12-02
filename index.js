const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const User = require('./models/user');

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto('https://github.com/login');

  // dom element selectors
  const USERNAME_SELECTOR = '#login_field';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block';

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(CREDS.username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(CREDS.password);

  await page.click(BUTTON_SELECTOR);
  await page.waitFor(1000);

  const userToSearch = 'Alex';                                                   // enter username 
  const searchUrl = `https://github.com/search?q=${userToSearch}&type=Users&utf8=%E2%9C%93`;

  await page.goto(searchUrl);
  await page.waitFor(2 * 1000);


  const LENGTH_SELECTOR_CLASS = '.user-list-item';
  const numPages = await getNumPages(page);
  console.log('Numpages: ', numPages);
  
const nameSelection = '.mr-1';
const emailSelection = '.muted-link';


var count = 1;
  for (var h = 1; h <= numPages; h++) {

   let pageUrl = searchUrl + '&p=' + h;
   await page.goto(pageUrl);
   page.waitForSelector('#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div');
   const lis = await page.$$(LENGTH_SELECTOR_CLASS);
   page.waitForSelector(LENGTH_SELECTOR_CLASS);
   for (var i = 1; i<lis.length;i++) {
    let email = '';
    let name = '';
    try{ email = await lis[i].$eval(emailSelection, emailSelection => emailSelection.innerText);} catch(e){
     continue;                                                                                  //if e-mail is not public we continue with the next person
    }
    try{  name = await lis[i].$eval(nameSelection, nameSelection=>nameSelection.innerText);} catch(e){       
      name = "No name";                                 
    }
    console.log(count +' -> ' + name + ' --- ' + email);                       // we print the data. We can use an RDBM to store data           
  count++;
  }
}
}

async function getNumPages(page) {
  const NUM_USER_SELECTOR = '#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div > div.d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative > h3';
  let inner = await page.evaluate((sel) => {
    let html = document.querySelector(sel).innerHTML;
    // format is: "69,803 users"
    return html.replace(',', '').replace('users', '').trim();
  }, NUM_USER_SELECTOR);

    const numUsers = parseInt(inner);

  console.log('numUsers: ', numUsers);                                    

  /**
   * GitHub shows 10 resuls per page, so
   */
  return Math.ceil(numUsers / 10);
}



run();