


# exploring altair in python

# altair also works in R: https://vegawidget.github.io/altair/articles/first-example.html



### all marks (ie chart building blocks like rect, circle, etc):
## https://altair-viz.github.io/user_guide/marks.html 




import pandas as pd
import altair as alt
init_data = pd.DataFrame({'a': list('CCCDDDEEE'),
                     'b': [2, 7, 4, 1, 2, 6, 8, 4, 7]})


chart = alt.Chart(data).mark_bar().encode(
    x='a',
    y='average(b)',
    tooltip=['a', 'b']
)

print(chart.to_json())

chart.save('/Users/apple/Desktop/chart.html')




from vega_datasets import data

source = data.iowa_electricity()
print(source.head())
chart = alt.Chart(source).mark_area(opacity=0.3).encode(
    x="year:T",
    y=alt.Y("net_generation:Q", stack=None),
    color="source:N"   # works without all the T/Q/N options added, but a little slow
)
chart.save('/Users/apple/Desktop/chart.html')




source = data.barley()
chart = alt.Chart(source).mark_bar().encode(
    x='sum(yield)',
    y='variety',
    color='site',
    order=alt.Order(
      # Sort the segments of the bars by this field
      'site',
      sort='ascending'
    ),
    tooltip = ['variety', 'year', 'site', 'yield']
)

text = chart.mark_text(   # making text labels, which borrows x/y data from 'chart'
    align='left',
    baseline='middle',
    dx=7
).encode(
    text='site'
)

chart = chart + text  # this adds text labels to the chart

chart.save('/Users/apple/Desktop/chart.html')   # text output is messy 




# making with different order
source = data.barley()
chart = alt.Chart(source).mark_bar().encode(
    x='variety',
    y='sum(yield)',
    color='site',
    order=alt.Order(
      # Sort the segments of the bars by this field
      'site',
      sort='descending'
    ),
    tooltip = ['variety', 'year', 'site', 'yield']
)
chart.save('/Users/apple/Desktop/chart.html')   # text output is messy 




# altair works with long, not wide, data

# choropleths should be reprojected to EPSG:4326 (source: https://altair-viz.github.io/user_guide/data.html)

# "Working with geographical data in Altair is possible if the object contains a
#__geo_interface__ attribute."  (From docs - looks like it works with geojson, but might
# be simpler than plotly)

# altair draws polygons left-ways, rather than right-ways, so might need to invert list of coords
# this direction is the 'winding order'




### stacking plots
cars = data.cars()
base = alt.Chart(cars).mark_point().encode(
    x='Horsepower:Q',
    y='Miles_per_Gallon:Q',
).properties(
    width=150,
    height=150
)
chart = alt.vconcat(
   base.encode(color='Cylinders:Q').properties(title='quantitative'),
   base.encode(color='Cylinders:O').properties(title='ordinal'),
   base.encode(color='Cylinders:N').properties(title='nominal'),
)
chart.save('/Users/apple/Desktop/chart.html')



### faceting plots
cars = data.cars()
chart = alt.Chart(cars).mark_point().encode(
    x='Horsepower:Q',
    y='Miles_per_Gallon:Q',
    facet=alt.Facet('Cylinders:O', columns=5)
)
chart.save('/Users/apple/Desktop/chart.html')


"""
Data Type	Shorthand Code	Description
quantitative	Q	a continuous real-valued quantity
ordinal	O	a discrete ordered quantity
nominal	N	a discrete unordered category
temporal	T	a time or date value
geojson	G	a geographic shape
"""



# lots of aggregation options, eg: sort, stack, and so on

# can fit regression lines and many other things - see the docs for more






## choropleth with tooltip
counties = alt.topo_feature(data.us_10m.url, 'counties')
source = data.unemployment.url   # 2 colunmns: 'id' for county, and 'rate' metric

chart = alt.Chart(counties).mark_geoshape().encode(
    color='rate:Q',
    tooltip= ['id:O', 'rate:Q']   # these cols can be joined on transform_lookup() below
).transform_lookup(
    lookup='id',
    from_=alt.LookupData(source, 'id', ['rate'])
).project(
    type='albersUsa'
).properties(
    width=800,
    height=800
)


chart.save('/Users/apple/Desktop/chart.html')






## may allow callbacks: 
# https://altair-viz.github.io/gallery/scatter_with_layered_histogram.html

### and brushing updating plot maybe:
# https://altair-viz.github.io/gallery/scatter_linked_brush.html

## including sliders and radar buttons:
# https://altair-viz.github.io/gallery/multiple_interactions.html

### basically just all the interactivity things:
# https://altair-viz.github.io/user_guide/interactions.html





# stacking charts, but not interactive
source = data.cars()
brush = alt.selection(type='interval')
points = alt.Chart(source).mark_point().encode(
    x='Horsepower:Q',
    y='Miles_per_Gallon:Q',
    color=alt.condition(brush, 'Origin:N', alt.value('lightgray'))
).add_selection(
    brush
)
bars = alt.Chart(source).mark_bar().encode(
    y='Origin:N',
    color='Origin:N',
    x='count(Origin):Q'
).transform_filter(
    brush
)
chart = points & bars
chart.save('/Users/apple/Desktop/chart.html')





# look for 'binding' in docs, as altair lets you bind more data to graphics a la D3





input_dropdown = alt.binding_select(options=['Europe','Japan','USA'])
selection = alt.selection_single(fields=['Origin'], bind=input_dropdown, name='Country of ')
color = alt.condition(selection,
                    alt.Color('Origin:N', legend=None),
                    alt.value('lightgray'))

chart = alt.Chart(cars).mark_point().encode(
    x='Horsepower:Q',
    y='Miles_per_Gallon:Q',
    color=color,
    tooltip='Name:N'
).add_selection(
    selection
)
chart.save('/Users/apple/Desktop/chart.html')





### The below doesn't work atm
cars = data.cars.url
brush = alt.selection_interval(encodings=['x'])

chart = alt.Chart(cars).mark_point().encode(
    y='Horsepower:Q',
    color=alt.condition(brush, 'Origin:N', alt.value('lightgray'))
).properties(
    width=250,
    height=250
).add_selection(
    brush
)

chart.encode(x='Acceleration:Q') | chart.encode(x='Miles_per_Gallon:Q')
chart.save('/Users/apple/Desktop/chart.html')




