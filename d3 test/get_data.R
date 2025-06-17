library("RCzechia")
library("tidyverse")

map <- RCzechia::orp_polygony()

map

install.packages("czso")
library("czso")

obyvatel <- czso::czso_get_table("SLDB-VYBER") 

install.packages("rmapshaper")
library("rmapshaper")
install.packages("geojsonR")
library("geojsonR")

map_json <- map %>%
  left_join(
obyvatel %>%
  filter(typuz_naz == "správní obvod ORP") %>%
  select(uzkod, obyvatel = vse1111), by = c("KOD_ORP" = "uzkod")) %>%
  select(-KOD_ORP, -KOD_KRAJ, -KOD_CZNUTS3, -NAZ_CZNUTS3) %>%
  mutate(obyvatel = as.integer(obyvatel)) %>%
  mutate(geometry = ms_simplify(geometry)) %>%
  geojsonsf::sf_geojson() %>%
write("map_data.geojson")

  
map %>%
  geojsonsf::sf_geojson()


library("sf")
kraje <- st_read("kraje.geojson")
okresy <- st_read("okresy.geojson")
orp <- st_read("orp.geojson")
obce <- st_read("obce.geojson")

paq_data <- read_csv("paq_data.csv")

kraje %>%
  left_join(irop, by = c("NUTS3_KOD" = "kraj")) %>%
  st_write("kraje_irop.geojson", delete_dsn = T)

obce %>%
  left_join(
    paq_data %>%
      select(KOD = 1, KANDIDATU = 9) %>% mutate(KOD = as.character(KOD), KANDIDATU = as.double(KANDIDATU)),
    by = "KOD") %>%
  st_write("obce_paq.geojson", delete_dsn = T)

orp %>%
  left_join(
    paq_data %>%
      select(KOD = 3, NAZEV = 4, KANDIDATU = 13) %>% mutate(KOD = as.character(KOD)) %>% summarise(.by = NAZEV, KANDIDATU = first(KANDIDATU, na_rm=T)),
    by = "NAZEV") %>%
  st_write("orp_paq.geojson", delete_dsn = T)

okresy %>%
  left_join(
    paq_data %>%
      select(KOD = 5, NAZEV = 6, KANDIDATU = 12) %>% mutate(KOD = as.character(KOD)) %>% summarise(.by = NAZEV, KANDIDATU = first(KANDIDATU, na_rm=T)),
    by = "NAZEV") %>%
  st_write("okresy_paq.geojson", delete_dsn = T)

kraje %>%
  left_join(
    paq_data %>%
      select(KOD = 7, NAZEV = 8, KANDIDATU = 11) %>% mutate(KOD = as.character(KOD)) %>% summarise(.by = NAZEV, KANDIDATU = first(KANDIDATU, na_rm=T)),
    by = "NAZEV") %>%
  st_write("kraje_paq.geojson", delete_dsn = T)

paq_data %>%
      select(KOD = 3, KANDIDATU = 13) %>% mutate(KOD = as.character(KOD)) %>% summarise(.by = KOD, KANDIDATU = first(KANDIDATU, na_rm=T))





    paq_data %>%
      select(KOD = 3, NAZEV = 4, KANDIDATU = 13) %>% mutate(KOD = as.character(KOD)) %>% summarise(.by = NAZEV, KANDIDATU = first(KANDIDATU, na_rm=T))
