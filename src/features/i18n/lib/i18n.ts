import { DEFAULT_LOCALE, INTL_LOCALES } from "../constants/i18n.constants";
import { en, type TranslationKey } from "../locales/en";
import { uk } from "../locales/uk";
import type { Locale } from "../types/Locale";
const dictionaries={en,uk};
export type TranslationValues=Readonly<Record<string,string|number>>;
export function translate(locale:Locale|undefined,key:TranslationKey,values?:TranslationValues){const dictionary=dictionaries[locale??DEFAULT_LOCALE] as Partial<Record<TranslationKey,string>>;let text=dictionary[key]??en[key]??key;for(const [name,value] of Object.entries(values??{}))text=text.replaceAll(`{${name}}`,String(value));return text;}
export const formatLocalizedDate=(value:Date,locale:Locale|undefined,options?:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat(INTL_LOCALES[locale??DEFAULT_LOCALE],options).format(value);
export const formatLocalizedNumber=(value:number,locale:Locale|undefined)=>new Intl.NumberFormat(INTL_LOCALES[locale??DEFAULT_LOCALE]).format(value);
export function plural(locale:Locale,count:number,forms:{one:string;few?:string;many:string}){const category=new Intl.PluralRules(INTL_LOCALES[locale]).select(count);return category==="one"?forms.one:category==="few"?(forms.few??forms.many):forms.many;}
export type CountUnit="part"|"color"|"guide"|"reference"|"file"|"check"|"item"|"visiblePart"|"unpaintedPart";
const countForms:Record<Locale,Record<CountUnit,{one:string;few?:string;many:string}>>={en:{part:{one:"part",many:"parts"},color:{one:"color",many:"colors"},guide:{one:"guide",many:"guides"},reference:{one:"reference",many:"references"},file:{one:"file",many:"files"},check:{one:"check",many:"checks"},item:{one:"selected item",many:"selected items"},visiblePart:{one:"visible part",many:"visible parts"},unpaintedPart:{one:"unpainted part",many:"unpainted parts"}},uk:{part:{one:"деталь",few:"деталі",many:"деталей"},color:{one:"колір",few:"кольори",many:"кольорів"},guide:{one:"гайд",few:"гайди",many:"гайдів"},reference:{one:"референс",few:"референси",many:"референсів"},file:{one:"файл",few:"файли",many:"файлів"},check:{one:"перевірка",few:"перевірки",many:"перевірок"},item:{one:"вибраний елемент",few:"вибрані елементи",many:"вибраних елементів"},visiblePart:{one:"видима деталь",few:"видимі деталі",many:"видимих деталей"},unpaintedPart:{one:"непофарбована деталь",few:"непофарбовані деталі",many:"непофарбованих деталей"}}};
export function formatCount(locale:Locale,count:number,unit:CountUnit){return `${formatLocalizedNumber(count,locale)} ${plural(locale,count,countForms[locale][unit])}`;}
