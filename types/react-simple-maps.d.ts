declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties, MouseEventHandler } from 'react'

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    style?: CSSProperties
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string
    children: (props: { geographies: Geography[] }) => ReactNode
  }

  interface Geography {
    rsmKey: string
    [key: string]: unknown
  }

  interface GeographyProps {
    key?: string
    geography: Geography
    style?: { default?: CSSProperties; hover?: CSSProperties; pressed?: CSSProperties }
  }

  interface MarkerProps {
    coordinates: [number, number]
    onClick?: MouseEventHandler<SVGGElement>
    style?: CSSProperties
    children?: ReactNode
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
  export function Marker(props: MarkerProps): JSX.Element
}
