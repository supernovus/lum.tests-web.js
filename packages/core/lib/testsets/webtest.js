import { setPlan, WebTest, WebFindTest } from "./common.js";
import wc from '@lumjs/web-core';

const plan = 17; 

/**
 * Test-set for basic functionality of the WebTest class.
 * @param {WebTest} t - Test instance being used/tested.
 * @returns {Promise<null>}
 */
export async function wtBasics(t) {
  
  t.isDocument(document, 'isDocument(document)');
  t.isQueryable(document, 'isQueryable(document)'); 
  t.isElement(document.body, 'isElement(document.body)');
  t.isNode(document.body, 'isNode(document.body)');
  t.isQueryable(document.body, 'isQueryable(document.body)');

  // NodeList
  let nodes = document.body.childNodes;
  t.isContainer(nodes, 'isContainer(body.childNodes)');
  t.isCollection(nodes, 'isCollection(body.childNodes)');
  
  // HTMLCollection
  nodes = document.body.children;
  t.isContainer(nodes, 'isContainer(body.children)');
  t.isCollection(nodes, 'isCollection(body.children)');

  // Array<Element>
  nodes = [document.body];
  t.isCollection(nodes, 'isCollection(Array<Element>)');

  // Add some elements to test queries against.
  let html = '<header><h1>Hello</h1></header><div id="foo" class="lol"></div>'
    + '<div id="bar"></div><footer><h6 class="lol">The End</h6></footer>';
  wc.ez.add(document.body, html);

  let found = t.findTest('div');
  t.isa(found, WebFindTest, 't.findTest() returns WebFindTest');

  found.isCount(2, "findTest('div').isCount(2)");
  found.isa(NodeList, "^ found a NodeList");
  found.isContainer('^ isContainer()');

  found = t.findTest('#foo');
  found.isCount(1, "findCount('#foo').isCount(1)");
  found.isa(HTMLDivElement, "^ found a <div> Element");
  found.isElement('^ isElement()');

  return null;
}
setPlan(wtBasics, plan);
