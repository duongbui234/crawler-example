/* eslint-disable prefer-const */
export const pageScraper = {
  setDateTime(string) {
    const dateTimeRegex = /(\d+):(\d+)\s(\d+)\/(\d+)\/(\d+)/; // 09:32 12/12/2022
    const dateRegArr = string.match(dateTimeRegex); // ["09:32 12/12/2022", "09", "32", "12", "12", "2022"]
    const newDate = new Date();
    newDate.setHours(dateRegArr[1] * 1, dateRegArr[2] * 1);
    newDate.setDate(dateRegArr[3] * 1);
    newDate.setMonth(dateRegArr[4] * 1 - 1);

    newDate.setFullYear(dateRegArr[5] * 1);
    return newDate;
  },
  async scraper(browser, originUrl) {
    let finalData = [];
    const perPage = 1;
    const originPage = await browser.newPage();
    await originPage.goto(originUrl);
    await originPage.waitForSelector('#main');
    await originPage.click('ul.pagination > li:last-child');
    const numOfPage = await originPage.$eval(
      '.pagination > .page-item.active > span',
      (span) => span.textContent,
    );

    console.time('time');

    const numOfGroups = Math.ceil(numOfPage / perPage);
    console.log(numOfGroups);

    for (let group = 1; group <= 2; group++) {
      const startPage = (group - 1) * perPage + 1; // 86-1 * 10 + 1 = 851
      const endPage = Math.min(startPage + perPage - 1, numOfPage); //  852

      const groupUrls = new Array(endPage - startPage + 1)
        .fill(0)
        .map((_, id) => originUrl.concat(`?page=${startPage + id}`));

      console.log(groupUrls);

      let groupResults = await Promise.all(
        groupUrls.map((url) => scrapeCurrentPage(url)),
      );
      groupResults = groupResults.filter((result) => result.length !== 0);
      groupResults = groupResults.flat();
      finalData = finalData.concat(groupResults);

      if (
        finalData[finalData.length - 1]['date_register']
          .toLocaleString()
          .includes('2022')
      ) {
        break;
      }
    }

    console.timeEnd('time');

    async function scrapeCurrentPage(url: string) {
      console.log(url);
      const scrapedData = [];
      const page = await browser.newPage();
      await page.goto(url);
      await page.waitForSelector('#main');

      let urls = await page.$$eval(
        '#left-col > section.section-post-listing > ul.post-listing > li > figure > a',
        (links) => links.map((link) => link.href),
      );

      const pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          try {
            console.log('start crawl detal page ' + link);
            const dataObj = {};
            const newPage = await browser.newPage();
            await newPage.goto(link);

            const frameHandle = await newPage.$('#__maps_content > iframe');
            const mapFrame = await frameHandle.contentFrame();
            const innerHtmlMapEmbed = await mapFrame.evaluate(
              () => document.documentElement.innerHTML,
            );

            const regex = /null,\[null,null,(-?[\d.]+),(-?[\d.]+)\]/; // null,[null,null,lat,lng]
            const match = innerHtmlMapEmbed.match(regex); // ["null,[null,null,lat,lng]", "lat","lng"]

            if (match && match[1] && match[2]) {
              dataObj['lat'] = parseFloat(match[1]);
              dataObj['lng'] = parseFloat(match[2]);
            }

            const titleElPromise = newPage.$('.page-header a');
            const addressElPromise = newPage.$('.post-address');
            const priceElPromise = newPage.$('.item.price span');
            const floorSizeElPromise = newPage.$('.item.acreage span');
            const descriptionElPromise = newPage.$(
              'section.post-main-content > .section-content',
            );
            const dateRegisterElPromise = newPage.$(
              'section.post-overview > .section-content > table > tbody > tr:nth-child(6) time',
            );
            const dateExpireElPromise = newPage.$(
              'section.post-overview > .section-content > table > tbody > tr:last-child time',
            );
            const usernameELPromise = newPage.$(
              'section.post-contact > .section-content > table > tbody > tr:nth-child(1) > td:last-child',
            );
            const phoneNumberElPromise = newPage.$(
              'section.post-contact > .section-content > table > tbody > tr:nth-child(2) > td:last-child',
            );
            const zaloNumberELPromise = newPage.$(
              'section.post-contact > .section-content > table > tbody > tr:nth-child(3) > td:last-child',
            );
            const imagesElPromise = newPage.$$('.swiper-wrapper > div > img');

            const [
              titleEl,
              addressEl,
              priceEl,
              floorSizeEl,
              descriptionEl,
              dateRegisterEl,
              dateExpireEl,
              usernameEl,
              phoneNumberEl,
              zaloNumberEl,
              imagesEl,
            ] = await Promise.all([
              titleElPromise,
              addressElPromise,
              priceElPromise,
              floorSizeElPromise,
              descriptionElPromise,
              dateRegisterElPromise,
              dateExpireElPromise,
              usernameELPromise,
              phoneNumberElPromise,
              zaloNumberELPromise,
              imagesElPromise,
            ]);

            const titlePromise =
              titleEl &&
              newPage.$eval('.page-header a', (title) => title.textContent);
            const addressPromise =
              addressEl &&
              newPage.$eval('.post-address', (title) =>
                title.textContent.replace('Địa chỉ: ', ''),
              );
            const pricePromise =
              priceEl &&
              newPage.$eval('.item.price span', (title) => {
                const matches = title.textContent.match(/\d+(\.\d+)?/gi);
                if (matches && matches.length) {
                  return matches[0] * 1;
                }
                return 0;
              });
            const floorSizePromise =
              floorSizeEl &&
              newPage.$eval(
                '.item.acreage span',
                (title) => title.textContent.match(/\d+/g)[0],
              );
            const descriptionPromise =
              descriptionEl &&
              newPage.$eval(
                'section.post-main-content > .section-content',
                (title) => title.innerHTML,
              );
            const dateRegisterPromise =
              dateRegisterEl &&
              newPage.$eval(
                'section.post-overview > .section-content > table > tbody > tr:nth-child(6) time',
                (text) => text.textContent,
              );
            const dateExpirePromise =
              dateExpireEl &&
              newPage.$eval(
                'section.post-overview > .section-content > table > tbody > tr:last-child time',
                (text) => text.textContent,
              );
            const usernamePromise =
              usernameEl &&
              newPage.$eval(
                'section.post-contact > .section-content > table > tbody > tr:nth-child(1) > td:last-child',
                (text) => text.textContent.trim(),
              );
            const phoneNumberPromise =
              phoneNumberEl &&
              newPage.$eval(
                'section.post-contact > .section-content > table > tbody > tr:nth-child(2) > td:last-child',
                (text) => text.textContent.trim(),
              );
            const zaloNumberPromise =
              zaloNumberEl &&
              newPage.$eval(
                'section.post-contact > .section-content > table > tbody > tr:nth-child(3) > td:last-child',
                (text) => text.textContent.trim(),
              );
            const imagesPromise =
              imagesEl &&
              newPage.$$eval('.swiper-wrapper > div > img', (imgs) =>
                imgs.map((img) => img.src),
              );

            let [
              title,
              address,
              price,
              floorSize,
              description,
              dateRegister,
              dateExpire,
              username,
              phoneNumber,
              zaloNumber,
              images,
            ] = await Promise.all([
              titlePromise,
              addressPromise,
              pricePromise,
              floorSizePromise,
              descriptionPromise,
              dateRegisterPromise,
              dateExpirePromise,
              usernamePromise,
              phoneNumberPromise,
              zaloNumberPromise,
              imagesPromise,
            ]);

            dateRegister = pageScraper.setDateTime(dateRegister);
            dateExpire = pageScraper.setDateTime(dateExpire);

            dataObj['title'] = title;
            dataObj['address'] = address;
            dataObj['price'] = price;
            dataObj['floor_size'] = floorSize;
            dataObj['description'] = description;
            dataObj['date_register'] = dateRegister;
            dataObj['date_expire'] = dateExpire;
            dataObj['username'] = username;
            dataObj['phone_number'] = phoneNumber;
            dataObj['zalo_number'] = zaloNumber;
            dataObj['images'] = images;

            console.log('done crawl detal page');
            resolve(dataObj);
            await newPage.close();
          } catch (error) {
            console.error(error);
            reject(error);
          }
        });

      for (const link of urls) {
        try {
          const currentPageData = await pagePromise(link);
          scrapedData.push(currentPageData);
        } catch (error) {
          console.log(
            '🚀 ~ file: pageScraperBds1.js:122 ~ scrapeCurrentPage ~ error:',
            error,
          );
          continue;
        }
      }

      await page.close();
      return scrapedData;
    }

    finalData = finalData.filter((d) => {
      return d.date_register.toLocaleString().includes('2023');
    });

    console.log(
      '🚀 ~ file: pageScraperBds1.js:97 ~ scraper ~ finalData:',
      finalData.length,
    );

    return finalData;
  },
};
