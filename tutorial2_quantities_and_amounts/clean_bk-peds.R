library(tidyverse)
library(skimr)
library(lubridate)

dat <- read_csv(file.choose())
dat$full_date <- mdy_hms(dat$hour_beginning)
dat$day <- format(dat$full_date, "%m/%d/%Y")
dat$mon_year <- format(dat$full_date, "%m/%Y")
dat$mon <- month(dat$full_date)
dat$year <- year(dat$full_date)

skim(dat)

dat_agg <- dat %>%
  group_by(mon_year) %>%
  summarise(avg_peds = mean(Pedestrians),
            tot_peds = sum(Pedestrians),
            sd_peds = sd(Pedestrians),
            n_obs = n()) 

write.csv(dat_agg, "~/personal/Interactive-Data-Vis-Sp2020/data/peds_agg.csv")
