const fs = require('fs');
let code = fs.readFileSync('src/pages/WeightLossLanding.jsx', 'utf8');

const codeNorm = code.replace(/\r\n/g, '\n');

const tStart = codeNorm.indexOf('<section className="mx-auto py-16 md:py-20">\n          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">\n            <div className="flex flex-col gap-3 text-center mb-12" data-aos="fade-up">\n\n              <h2 className="font-heading text-4xl font-black uppercase text-slate-900">\n                {locale === \'lt\' ? \'Klientø atsiliepimai\' : \'Client testimonials\'}');
if (tStart === -1) {
  console.log("Could not find testimonials section start");
  process.exit();
}
const tEndStr = '              </button>\n            </div>\n          </div>\n        </section>';
const tEnd = codeNorm.indexOf(tEndStr, tStart) + tEndStr.length;

const fStart = codeNorm.indexOf('<section className="relative overflow-hidden py-16 md:py-24">\n          <div className="absolute inset-0">\n             <img src={fromUploads(\'IMG_0488-scaled.jpg\')');
if (fStart === -1) {
  console.log("Could not find faq section start");
  process.exit();
}
const fEndStr = '              ))}\n            </div>\n          </div>\n        </section>';
const fEnd = codeNorm.indexOf(fEndStr, fStart) + fEndStr.length;

console.log({tStart, tEnd, fStart, fEnd});

const tBlock = codeNorm.substring(tStart, tEnd);
const fBlock = codeNorm.substring(fStart, fEnd);

const fullSegment = codeNorm.substring(tStart, fEnd);
const newSegment = fBlock + '\n\n        ' + tBlock;

const newCode = codeNorm.replace(fullSegment, newSegment);

fs.writeFileSync('src/pages/WeightLossLanding.jsx', newCode);
console.log('swapped');
