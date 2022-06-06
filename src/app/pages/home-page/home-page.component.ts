import { Component } from '@angular/core'
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms'

import { BehaviorSubject, Observable, of, Subject } from 'rxjs'

import * as airlines from '../../../assets/airlines.json'
import { environment } from '../../../environments/environment'

interface Airline {
  name: string
  url: string
  logoUrl: string
  options: {
    name: string
    maxWeight: number
    dimensions: {
      h: number
      w: number
      d: number
    }
  }[]
}

interface FlatAirline {
  name: string
  maxWeight: number
  dimensions: {
    h: number
    w: number
    d: number
  }
  airline: {
    name: string
    url: string
    logoUrl: string
  }
}

@Component({
  selector: 'app-home-page',
  templateUrl: 'home-page.component.html',
  styleUrls: ['home-page.component.scss'],
})
export class HomePageComponent {
  filteredAirlinesOptions: Subject<FlatAirline[]>

  readonly airlinesOptions: FlatAirline[]
  readonly myDimensions: FormGroup
  readonly inputs: {
    name: string
    control: FormControl
  }[]

  constructor () {
    this.myDimensions = new FormGroup({
      height: new FormControl(environment.production ? 0 : 44, {
        validators: [Validators.required]
      }),
      width: new FormControl(environment.production ? 0 : 28, {
        validators: [Validators.required]
      }),
      depth: new FormControl(environment.production ? 0 : 19, {
        validators: [Validators.required]
      }),
      weight: new FormControl(environment.production ? 0 : 8, {
        validators: [Validators.required]
      })
    })
    this.myDimensions.valueChanges.subscribe(this.updateAirlineOptions.bind(this))
    this.inputs = [
      {
        name: 'Height',
        control: this.myDimensions.get('height') as FormControl
      },
      {
        name: 'Width',
        control: this.myDimensions.get('width') as FormControl
      },
      {
        name: 'Depth',
        control: this.myDimensions.get('depth') as FormControl
      },
      {
        name: 'Weight',
        control: this.myDimensions.get('weight') as FormControl
      }
    ]

    this.airlinesOptions = ((airlines as any).default as Airline[]).reduce((acc, cur) => {
      return [...acc, ...cur.options.map((el) => ({
        ...el,
        airline: {
          name: cur.name,
          url: cur.url,
          logoUrl: cur.logoUrl
        }
      }))]
    }, [] as FlatAirline[])
    this.filteredAirlinesOptions = new BehaviorSubject(HomePageComponent.airlineOptionsFilter(this.airlinesOptions, this.myDimensions.getRawValue()))
  }

  private static airlineOptionsFilter (options: FlatAirline[], values: { height: number, width: number, depth: number, weight: number }) {
    return options.filter((el) => {
      return (values.height || 0) <= el.dimensions.h &&
        (values.width || 0) <= el.dimensions.w &&
        (values.depth || 0) <= el.dimensions.d &&
        (values.weight || 0) <= el.maxWeight
    })
  }

  private updateAirlineOptions (values: { height: number, width: number, depth: number, weight: number }) {
    this.filteredAirlinesOptions.next(HomePageComponent.airlineOptionsFilter(this.airlinesOptions, values))
  }
}
