library(tidyverse)
library(skimr)
library(lubridate)

dat <- read_csv("~/personal/Interactive-Data-Vis-Sp2020/data/Brooklyn_Bridge_Automated_Pedestrian_Counts_Demonstration_Project.csv")

######
###### For 2/13/20 horizontal barchart hw
######
dat$full_date <- mdy_hms(dat$hour_beginning)
dat$day <- format(dat$full_date, "%m/%d/%Y")
dat$mon_year <- format(dat$full_date, "%m/%Y")
dat$mon <- month(dat$full_date)
dat$year <- year(dat$full_date)

skim(dat)

dat_agg <- dat %>%
  group_by(day) %>%
  summarise(daily_peds = sum(Pedestrians)) %>%
  ungroup() %>%
  mutate(mon_year = paste0(substr(day, 1, 3), 
                           substr(day, 9, 10))) %>%
  group_by(mon_year) %>%
  summarise(avg_peds = mean(daily_peds),
            tot_peds = sum(daily_peds),
            sd_peds = sd(daily_peds),
            n_obs = n())

write.csv(dat_agg, "~/personal/Interactive-Data-Vis-Sp2020/data/peds_agg.csv")



######
###### For 2/20/20 scatterplot hw
######
dat <- read_csv("~/personal/Interactive-Data-Vis-Sp2020/data/Brooklyn_Bridge_Automated_Pedestrian_Counts_Demonstration_Project.csv")

newdat <- dat %>%
  gather(direction, count, `Towards Manhattan`:`Towards Brooklyn`) %>%
  select(hour_beginning, temperature, direction, count)
write.csv(newdat, "~/personal/Interactive-Data-Vis-Sp2020/data/peds_long.csv")


