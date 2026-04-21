import model1 from './model1.png'
import model2 from './model2.png'
import model3 from './model3.png'
import model4 from './model4.png'
import model5 from './moodel5.png'
import model6 from './model6.png'
import model7 from './model7.png'
import model9 from './model9.png'
import model10 from './model10 (2).png'
import modelVideoA from './modelviedo.mp4'
import modelVideoB from './modelvid.mp4'

export type CatalogProduct = {
  slug: string
  route: string
  legacyRoute: string
  title: string
  collectionLabel: string
  image: string
  video?: string
}

export const catalogProducts: CatalogProduct[] = [
  {
    slug: 'lady-suit',
    route: '/products/lady-suit',
    legacyRoute: '/Photo1',
    title: 'Lady Suit',
    collectionLabel: 'Look 01',
    image: model1,
    video: modelVideoA,
  },
  {
    slug: 'studio-look-02',
    route: '/products/studio-look-02',
    legacyRoute: '/Photo2',
    title: 'Studio Look 02',
    collectionLabel: 'Look 02',
    image: model2,
    video: modelVideoB,
  },
  {
    slug: 'studio-look-03',
    route: '/products/studio-look-03',
    legacyRoute: '/Photo3',
    title: 'Studio Look 03',
    collectionLabel: 'Look 03',
    image: model3,
  },
  {
    slug: 'studio-look-04',
    route: '/products/studio-look-04',
    legacyRoute: '/Photo4',
    title: 'Studio Look 04',
    collectionLabel: 'Look 04',
    image: model4,
  },
  {
    slug: 'studio-look-05',
    route: '/products/studio-look-05',
    legacyRoute: '/Photo5',
    title: 'Studio Look 05',
    collectionLabel: 'Look 05',
    image: model5,
  },
  {
    slug: 'studio-look-06',
    route: '/products/studio-look-06',
    legacyRoute: '/Photo6',
    title: 'Studio Look 06',
    collectionLabel: 'Look 06',
    image: model6,
  },
  {
    slug: 'studio-look-07',
    route: '/products/studio-look-07',
    legacyRoute: '/Photo7',
    title: 'Studio Look 07',
    collectionLabel: 'Look 07',
    image: model7,
  },
  {
    slug: 'studio-look-09',
    route: '/products/studio-look-09',
    legacyRoute: '/Photo9',
    title: 'Studio Look 09',
    collectionLabel: 'Look 09',
    image: model9,
  },
  {
    slug: 'studio-look-10',
    route: '/products/studio-look-10',
    legacyRoute: '/Photo10',
    title: 'Studio Look 10',
    collectionLabel: 'Look 10',
    image: model10,
  },
]

export function getCatalogProduct(slug: string | undefined) {
  return catalogProducts.find((product) => product.slug === slug)
}
