
### Gets json geo data, generates trends, and saves as R image 

library(jsonlite)
j <- fromJSON("https://amplify-wildrydes-dev-90718-deployment.s3.eu-west-2.amazonaws.com/camden_polys_noid.json")$features

lsoas <-unlist(j$properties[1])

get_lat_long <- function(vec) {
  vec <- unlist(vec)
  l <- length(vec)
  output <- list()
  output[["lon"]] <- vec[1:(l / 2)]
  output[["lat"]] <- vec[((l / 2) + 1): l]
  return(output)
}


out_list <- list()

for (i in 1:length(lsoas)) {
  
  temp_list <- list()
  temp_list[["lsoa"]] <- lsoas[i]
  
  lon_lats <- get_lat_long(j$geometry$coordinates[i])
  temp_list[["lon"]] <- lon_lats[1]
  temp_list[["lat"]] <- lon_lats[2]
  temp_list[['fill_val']] <- round(runif(1, 1, 5))
  temp_list[['trend']] <- runif(6, 1, 5)
  
  out_list[[i]] <- temp_list
}


# save list
save.image("/Users/apple/Desktop/front_end/d3_course/camden_json.RData")



