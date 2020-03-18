library(tidyverse)
library(readxl)

dat_1 <- readxl::read_xlsx("~/personal/Interactive-Data-Vis-Sp2020/data/voter-turnout.xlsx", sheet = 1)
dat_2 <- readxl::read_xlsx("~/personal/Interactive-Data-Vis-Sp2020/data/voter-turnout.xlsx", sheet = 2)

dat_1$type = "turnout_rate"
dat_2$type = "share_electorate"

dat <- bind_rows(dat_1, dat_2)

dat_long <- dat  %>%
  pivot_longer(-c(age, type), names_to = "year", values_to = "perc") %>%
  mutate(yeartypeage = paste0(paste0(year, type), age))

write_csv(dat_long, "~/personal/Interactive-Data-Vis-Sp2020/data/voter-turnout_long.csv")
