library("tidyverse")
library("ggtext")
library("lubridate")
library("ggridges")
library("ggrepel")
library("stringi")
library("fs")

theme_cp <- function() { 
  theme(legend.position = "bottom",
        
        plot.title = element_textbox_simple(margin = margin(5,0,5,0)),
        plot.subtitle = element_textbox_simple(margin = margin(10,0,10,0)),
        plot.background = element_rect("#F3F3F3"), 
        
        panel.background = element_rect(fill = "transparent", colour = "transparent"),
        panel.grid = element_blank(),
        panel.grid.major.y = element_line("#CFE2F3"),
        
        strip.background = element_blank(),
        strip.text = element_text(face = "bold"),
        
        legend.background = element_blank()
    )
}

theme_cp_flipped_axis <- function() { 
  theme(legend.position = "bottom",
        
        plot.title = element_textbox_simple(margin = margin(5,0,5,0)),
        plot.subtitle = element_textbox_simple(margin = margin(10,0,10,0)),
        plot.background = element_rect("#F3F3F3"), 
        
        panel.background = element_rect(fill = "transparent", colour = "transparent"),
        panel.grid = element_blank(),
        panel.grid.major.x = element_line("#CFE2F3"),
        
        strip.background = element_blank(),
        strip.text = element_text(face = "bold"),
        
        legend.background = element_blank()
    )
}

theme_cp_both_axes <- function() { 
  theme(legend.position = "bottom",
        
        plot.title = element_textbox_simple(margin = margin(5,0,5,0)),
        plot.subtitle = element_textbox_simple(margin = margin(10,0,10,0)),
        plot.background = element_rect("#F3F3F3"), 
        
        panel.background = element_rect(fill = "transparent", colour = "transparent"),
        panel.grid = element_blank(),
        panel.grid.major.x = element_line("#CFE2F3"),
        panel.grid.major.y = element_line("#CFE2F3"),
        
        strip.background = element_blank(),
        strip.text = element_text(face = "bold"),
        
        legend.background = element_blank()
    )
}

theme_cp_map <- function() {
  theme_cp() +
    theme(axis.text = element_blank(),
          axis.ticks = element_blank())
}

save_plot <- function(name, plot, save_width=8, save_height=6, subfolder="") {
  folder <- paste0("C:\\Users\\Matous\\Desktop\\CP Oddluzeni Data\\Plots\\", if_else(subfolder == "", "", paste0(subfolder, "\\")))
  
  print(plot)
  
  current_date <- format(Sys.Date(), "%Y-%m-%d")
  subfolder_path <- paste0(folder, paste(current_date, name))
  
  dir_create(subfolder_path)
  
  write_csv2(plot$data, paste0(subfolder_path,"\\",name,"_data.csv"))
  
  ggsave(paste0(folder,name,".png"), plot=plot, width=save_width, height=save_height)
  save(plot, file=paste0(subfolder_path,"\\", name,".RData"))
  ggsave(paste0(subfolder_path,"\\", name,".png"), plot=plot, width=save_width, height=save_height)
  ggsave(paste0(subfolder_path,"\\", name,".svg"), plot=plot, width=save_width, height=save_height)
}

read_clipboard <- function(name, cols = NA, locale=1, subfolder="", rewrite=FALSE, ...) {
  file_path <- paste0("C:\\Users\\Matous\\Desktop\\CP Oddluzeni Data\\Data\\", if_else(subfolder == "", "", paste0(subfolder, "\\")), name, ".csv")
  
  path <- if_else(rewrite | !file.exists(file_path), "clipboard", file_path)
  
  if (locale == 1) {
    reader <- read.csv
  }
  else if (locale == 2) {
    reader <- read.csv2
  }
  
  if (length(cols) == 0) {
    data <- reader(path)
  }
  else {
    data <- reader(path, col.names = cols, ...)
  }
  
  if (rewrite | !file.exists(file_path)) {
    if (locale == 1) {
      writer <- write.csv
    }
    else if (locale == 2) {
      writer <- write.csv2
    }
    writer(data, file_path)
  }
  
  return(data)
  
}

save_plot2 <- function(plot, name, save_width=8, save_height=6, subfolder="") {
  save_plot(name, plot, save_width, save_height, subfolder)
}

scale_label_big_number <- scales::comma_format(big.mark = " ", decimal.mark = ",")
scale_label_kc <- scales::comma_format(big.mark = " ", decimal.mark = ",", suffix = " Kč")
scale_label_tis_kc <- scales::comma_format(big.mark = " ", decimal.mark = ",", suffix = " tis. Kč")
scale_label_mil_kc <- scales::comma_format(big.mark = " ", decimal.mark = ",", suffix = " mil. Kč")
scale_label_mld_kc <- scales::comma_format(big.mark = " ", decimal.mark = ",", suffix = " mld. Kč")
transparent <- alpha("white", 0)


remove_czech_diacritics <- function(str) {
  
  str <- stri_trans_general(str, "Latin-ASCII")
  return(str)
}


theme_mf <- function(grid = "y") {
  
  if(grid == "y") {
    theme_cp() + theme(
    plot.background = element_rect(fill = "#fff2e3"),
    panel.grid.major.y = element_line(colour = "#c9bcab"))
  }
  else if(grid == "x") {
    theme_cp() + theme(
    plot.background = element_rect(fill = "#fff2e3"),
    panel.grid.major.x = element_line(colour = "#c9bcab"))
  }
  else if(grid == "none") {
    theme_cp() + theme(
    plot.background = element_rect(fill = "#fff2e3")
    )
  }
  else if(grid == "both") {
    theme_cp() + theme(
    plot.background = element_rect(fill = "#fff2e3"),
    panel.grid.major.x = element_line(colour = "#c9bcab"),
    panel.grid.major.y = element_line(colour = "#c9bcab")
    )
  }
}

locale_cs_windows_encoding <- locale("cs", encoding = "ISO8859-1")

get_rze_connection <- function() {
  library(DBI)
  library(RPostgres)
  
  dbConnect(
    Postgres(),
    dbname = "postgres",
    host = "localhost",
    port = 5432,
    user = "postgres",
    password = "postgres"
  )
}

















