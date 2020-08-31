'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder, ElementArrayFinder, ExpectedConditions } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of Heroes';
const expectedTitle = `${expectedH1}`;
const targetHero = { id: 15, name: 'Magneta' };
const targetHeroDashboardIndex = 3;
const nameSuffix = 'X';
const newHeroName = targetHero.name + nameSuffix;

class Hero {
  id: number;
  name: string;

  // Factory methods

  // Hero from string formatted as '<id> <name>'.
  static fromString(s: string): Hero {
    return {
      id: +s.substr(0, s.indexOf(' ')),
      name: s.substr(s.indexOf(' ') + 1),
    };
  }

  // Hero from hero list <li> element.
  static async fromLi(li: ElementFinder): Promise<Hero> {
      let stringsFromA = await li.all(by.css('a')).getText();
      let strings = stringsFromA[0].split(' ');
      return { id: +strings[0], name: strings[1] };
  }

  // Hero id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Hero> {
    // Get hero id from the first <div>
    let _id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    let _name = await detail.element(by.css('h2')).getText();
    return {
        id: +_id.substr(_id.indexOf(' ') + 1),
        name: _name.substr(0, _name.lastIndexOf(' '))
    };
  }
}

describe('Proyecto base', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topHeroes: element.all(by.css('app-root app-dashboard > div h4')),

      appHeroesHref: navElts.get(1),
      appHeroes: element(by.css('app-root app-heroes')),
      allHeroes: element.all(by.css('app-root app-heroes li')),
      selectedHeroSubview: element(by.css('app-root app-heroes > div:last-child')),

      heroDetail: element(by.css('app-root app-hero-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
        expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Heroes'];
    it(`has views ${expectedViewNames}`, () => {
      let viewNames = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', () => {
      let page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });

    //  Ejemplo: h3 Top Heroes
    it(`has h3 'Top Heroes'`, ()=>{
      expectHeading(3, 'Top Heroes')
    })

    // 1 Buscar un héroe
    var hero_searched = 'Bombasto';
    it(`Buscando a '${hero_searched}'`, ()=>{
      let search_input = element(by.id('search-box'));
      let results_box = element(by.css('.search-result'));
      search_input.sendKeys(hero_searched);

      element.all(by.css('.search-result li a')).then((option)=>{        
        expect(option[0].getText()).toBe(hero_searched); // Resultado de la búsqueda
      })
    })

    // 2. Eliminar un héroe
    var hero_to_delete = 'Magneta';
    it(`Héroe '${hero_to_delete}' eliminado.`, ()=>{
      browser.get('./heroes'); // Navegar a lista de heroes
      element.all(by.css('.heroes li a')).then((item)=>{
        console.log(`Hay ${item.length} heroes`)
        console.log(`Eliminado a ${hero_to_delete}`)
      })
      
      element(by.xpath('/html/body/app-root/app-heroes/ul/li[5]/button')).click();
      
      element.all(by.css('.heroes li a')).then((item)=>{
        console.log(`Hay ${item.length} heroes`)
        expect(item.length).toBe(9);
      })
      
    })

    // 3. Editar un héroe
    var hero_to_delete = 'Narco';
    it(`Héroe '${hero_to_delete}' actualizado.`, async ()=>{
      await browser.get('./heroes'); // Navegar a lista de heroes
      
      await element(by.xpath('/html/body/app-root/app-heroes/ul/li[2]/a')).click();

      await element(by.xpath('/html/body/app-root/app-hero-detail/div/div[2]/label/input')).sendKeys(' II');

      await element(by.xpath('/html/body/app-root/app-hero-detail/div/button[2]')).click();
                        
      
      var until = ExpectedConditions;

      await browser.wait(until.presenceOf(element(by.xpath('/html/body/app-root/app-heroes/ul/li[2]/a'))), 5000, 'Element taking too long to appear in the DOM');
      
      await element.all(by.css('.heroes li a')).then((item)=>{
        expect(item[1].getText()).toBe('12 Narco II')
      })
  
    })

    // 4 Navegar a un héroe desde el dashboard
    var hero_from_dashboard='Celeritas';
    it(`Navegando a '${hero_from_dashboard}' desde el dashboard`, async ()=>{
      await browser.get('./dashboard');
      await element(by.xpath('/html/body/app-root/app-dashboard/div/a[3]')).click()

      var until = ExpectedConditions;

      await browser.wait(until.presenceOf(element(by.xpath('/html/body/app-root/app-hero-detail/div/h2'))), 5000, 'Element taking too long to appear in the DOM');
      // CELERITAS Details
      await expect(element(by.xpath('/html/body/app-root/app-hero-detail/div/h2')).getText()).toBe('CELERITAS Details')
    });

    // 5 
    var hero_to_delete = 'Dynama';
    it(`Navegar a '${hero_to_delete}' desde lista de heroes.`, async ()=>{
      await browser.get('./heroes'); // Navegar a lista de heroes
      
      await element(by.xpath('/html/body/app-root/app-heroes/ul/li[7]/a')).click();

      var until = ExpectedConditions;

      await browser.wait(until.presenceOf(element(by.xpath('/html/body/app-root/app-hero-detail/div/h2'))), 5000, 'Element taking too long to appear in the DOM');
      // Dyname Details
      await expect(element(by.xpath('/html/body/app-root/app-hero-detail/div/h2')).getText()).toBe('DYNAMA Details')
      
    })


    // 6. Navegar a un héroe desde la búsqueda
    var hero_searched = 'Bombasto';
    it(`Buscando y navegando a '${hero_searched}'`, ()=>{
      browser.get('./dashboard');
      let search_input = element(by.id('search-box'));
      let results_box = element(by.css('.search-result'));
      search_input.sendKeys(hero_searched);

      element.all(by.css('.search-result li a')).then((option)=>{        
        expect(option[0].getText()).toBe(hero_searched); // Resultado de la búsqueda
        option[0].getAttribute('href').then((str)=>{
          browser.get(`${str}`); // Navegando
        });
        
      })
    })

    


  });

});



function addToHeroName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getHeroAEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getHeroLiEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toHeroArray(allHeroes: ElementArrayFinder): Promise<Hero[]> {
  let promisedHeroes = await allHeroes.map(Hero.fromLi);
  // The cast is necessary to get around issuing with the signature of Promise.all()
  return <Promise<any>> Promise.all(promisedHeroes);
}
