package com.box.l10n.mojito.quartz;

import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

import javax.sql.DataSource;

@Configuration
public class QuartzSchedulerConfig {

    @Autowired
    ApplicationContext applicationContext;

    @Autowired
    DataSource dataSource;

    @Autowired
    QuartzPropertiesConfig quartzPropertiesConfig;

    @Autowired
    Trigger[] triggers;

    /**
     * Creates the scheduler with triggers/jobs defined in spring beans.
     *
     * The spring beans should use the default group so that it is easy to keep track of new or removed triggers/jobs.
     *
     * In {@link #startScheduler()} triggers/jobs present in Quartz but without a matching spring bean will be
     * removed.
     *
     * Other job and trigger created dynamically must not used the default group else they'll be removed.
     *
     * @return
     * @throws SchedulerException
     */
    @Bean
    public SchedulerFactoryBean scheduler() throws SchedulerException {

        SchedulerFactoryBean schedulerFactory = new SchedulerFactoryBean();
        schedulerFactory.setDataSource(dataSource);
        schedulerFactory.setQuartzProperties(quartzPropertiesConfig.getQuartzProperties());
        schedulerFactory.setJobFactory(springBeanJobFactory());
        schedulerFactory.setOverwriteExistingJobs(true);
        schedulerFactory.setTriggers(triggers);
        schedulerFactory.setAutoStartup(false);

        return schedulerFactory;
    }

    @Bean
    public SpringBeanJobFactory springBeanJobFactory() {
        AutoWiringSpringBeanJobFactory jobFactory = new AutoWiringSpringBeanJobFactory();
        jobFactory.setApplicationContext(applicationContext);
        return jobFactory;
    }
}