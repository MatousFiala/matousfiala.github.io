library("tidyverse")
load(url("https://matousfiala.cz/cp_edu_viz_data.RData"))

# Co se děje v těhle datech?
points_clean

# Pomůže nám statistika?
mean(points_clean$x)
mean(points_clean$y)
cor(points_clean$x, points_clean$y)

# a co vizualizace?
ggplot(points_clean, aes(x = x, y = y)) + geom_point() + geom_path()

# -- EDA vs communation -- #

show(plot_eda)
show(plot_communication)

# ---- Basic plots ----- #

# Histogram

# Používáme data "exekuce", ve kterých jsou všechny osoby kteří měli 1.1.2025 aktivní exekuci
exekuce

# Chceme znát, jak je rozdělený počet exekucí
# Funkce ggplot vytvoří graf
ggplot(
  # Jako data používáme exekuc
  data = exekuce,
  # funkce aes() definuje estitické zobrazení -- mapuje sloupce v datech na vizuální dimenze (osu x, y, barvu atd.)
  mapping = aes(
    # Na ose x chceme mít počet exekucí
    x = pocet_exekuci
  )
) + # <-- definovali jsme si základ grafu, teď k němu přidáváme jednotlivé prvky
# geom_histogram definuje, že data zobrazujeme pomocí histogramu a vypočítá chlívky
geom_histogram()

exekuce %>%
  ggplot(
    exekuce,
    aes(x = pocet_exekuci))  +
  geom_histogram(
    # Histogram můžeme upravovat pomocí argumentů. Jaké jsou argumenty můžete zjistit, 
    # když do konzole zadáte příkaz "?geom_histogram". Cheme mít více chlívků, aby se
    # počty exekucí neslévaly k sobě
    bins = 50
  )

# Sloupcový graf
# --------------

# Máme mediánový počet exekucí podle věkové kategorie
exekuce_veky

ggplot(
  exekuce_veky,
  # Sloupcový graf vyžaduje 2 estetiky -- osu x (sloupce) a osu y (výšku sloupce)
  aes(x = vekovy_interval, y = median_exekuci)) +
  geom_col()


# Čárový graf
# -----------

byty_celkem_olm

ggplot(
  byty_celekm_olm,
  # Čarový graf opět vyžaduje osu x a osu y
  aes(x = rok, y = pocet_dokoncenych_bytu)) +
geom_line()

byty_vsechny_typy_olm 

# Nyní chceme víc čar: jednu pro každý typ bytu
ggplot(byty_vsechny_typy_olm,
       aes(
         x = rok,
         y = pocet_dokoncenych_bytu,
         # Definujeme, že se mají elementty barvit podle typu bytu. ggplot2 pozná,
         # že chceme aby každý typ bytu měl svoji čáru
         colour = typ_bytu)
       ) +
geom_line()

byty_vsechny_typy

# Teď jsme přidali několik dalších měst. Mohli bychom mít pro každé město 3 čáry,
# to by ale bylo matoucí. Můžeme tedy mít podgraf pro každé město
ggplot(byty_vsechny_typy, 
       aes(x = rok,
           y = pocet_dokoncenych_bytu,
           colour = typ_bytu)
       ) + 
geom_line() +
# facet_wrap definuje rozdělení grafů podle sloupce mesto (podle = ~)
facet_wrap(~mesto)

# Bodový graf
# -----------

exekuce_a_soc_vylouceni %>%
  # Bodový graf opět vyžaduje mapping pro osu x a osu y
  ggplot(aes(x = socialni_vylouceni, y = procento_v_exekuci)) +
  geom_point()

# Body se nám ale překrývají. Specifické možnosti (najdete pod příkazem ?geom_point )
?geom_point

exekuce_a_soc_vylouceni %>%
  ggplot(aes(x = socialni_vylouceni, y = procento_v_exekuci)) +
  # argument postition = "jitter" body trochu "zaštěrchá" aby neležely na sobě. 
  # argument alpha značí průhlednost (0 = průhledný, 1 = solidní) snížením uvidíme,
  # když se dva doby překrávají
  geom_point(position = "jitter", alpha = 0.5)

exekuce_a_soc_vylouceni %>%
  ggplot(aes(x = socialni_vylouceni, y = procento_v_exekuci)) +
  geom_point(position = "jitter") +
  # Ke grafu můžeme přidávat další prvky - zkusme třeba trend
  stat_smooth()

exekuce_a_soc_vylouceni %>%
  ggplot(aes(x = socialni_vylouceni, y = procento_v_exekuci)) +
  geom_point(position = "jitter") +
  facet_wrap(~kraj) +
  stat_smooth()
  














