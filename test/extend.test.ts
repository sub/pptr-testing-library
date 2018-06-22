import * as path from 'path'
import * as puppeteer from 'puppeteer'
import '../lib/extend'

describe('lib/extend.ts', () => {
  let browser: puppeteer.Browser
  let page: puppeteer.Page
  let document: puppeteer.ElementHandle

  it('should launch puppeteer', async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    await page.goto(`file://${path.join(__dirname, 'fixtures/page.html')}`)
  })

  it('should extend puppeteer ElementHandle', async () => {
    document = await page.getTestingUtilsForDocument()
    expect(typeof document.queryAllByAltText).toBe('function')
  })

  it('should handle the query* methods', async () => {
    const element = await document.queryByText('Hello h1')
    expect(element).toBeTruthy()
    expect(await page.evaluate(el => el.textContent, element)).toEqual('Hello h1')
  })

  it('should handle regex matching', async () => {
    const element = await document.queryByText(/Hello/)
    expect(element).toBeTruthy()
    expect(await page.evaluate(el => el.textContent, element)).toEqual('Hello h1')
  })

  it('should handle the get* methods', async () => {
    const element = await document.getByTestId('testid-text-input')
    expect(await page.evaluate(el => el.outerHTML, element)).toMatchSnapshot()
  })

  it('should handle the LabelText methods', async () => {
    const element = await document.getByLabelText('Label A')
    expect(await page.evaluate(el => el.outerHTML, element)).toMatchSnapshot()
  })

  it.skip('should handle the queryAll* methods', async () => {
    const elements = await document.queryAllByText(/Hello/)
    expect(elements).toHaveLength(2)

    const text = await Promise.all([
      page.evaluate(el => el.textContent, elements[0]),
      page.evaluate(el => el.textContent, elements[1]),
    ])

    expect(text).toEqual(['Hello h1', 'Hello h2'])
  })

  it('should scope results to element', async () => {
    const scope = await document.$('#scoped')
    const element = await scope.queryByText(/Hello/)
    expect(await page.evaluate(el => el.textContent, element)).toEqual('Hello h3')
  })

  afterAll(async () => {
    await browser.close()
  })
})